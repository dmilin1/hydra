import * as Sentry from "@sentry/react-native";
import { createContext, useEffect, useRef, useState } from "react";

import { UserAuth } from "../api/Authentication";
import { User } from "../api/User";
import { resetGqlSessionState } from "../api/gql/Session";
import { getCurrentUser } from "../api/gql/User";
import { changeSessionCookies } from "../api/gql/WebToken";
import KeyStore from "../utils/KeyStore";
import RedditCookies from "../utils/RedditCookies";
import { Alert } from "react-native";
import { fixIncompatibleAccountSettings } from "../api/gql/AccountSettings";

type AccountContextType = {
  loginInitialized: boolean;
  currentUser: User | null;
  accounts: string[];
  /** null when a later login or logout superseded this one. */
  logIn: (username?: string) => Promise<boolean | null>;
  logOut: () => Promise<void>;
  removeUser: (username: string) => Promise<void>;
  doWithTempLogout: (fn: () => Promise<boolean>) => Promise<void>;
};

const initialAccountContext: AccountContextType = {
  loginInitialized: false,
  currentUser: null,
  accounts: [],
  logIn: async () => false,
  logOut: async () => {},
  removeUser: async () => {},
  doWithTempLogout: async () => {},
};

export const AccountContext = createContext(initialAccountContext);

export function AccountProvider({ children }: React.PropsWithChildren) {
  const [loginInitialized, setLoginInitialized] = useState(false);
  const [currentUser, setCurrentUser] =
    useState<AccountContextType["currentUser"]>(null);
  const [accounts, setAccounts] = useState<AccountContextType["accounts"]>([]);
  // Bumped by every login and logout. A login that another one superseded
  // backs off: the jar no longer holds its session.
  const sessionAttempt = useRef(0);

  // Every request can renew reddit_session (it slides 6 months), but only a
  // login saves it, so keep the stored account's renewed one before the jar
  // changes.
  const swapSessionCookies = (change: () => Promise<void>) =>
    changeSessionCookies(async () => {
      const stored = KeyStore.getString("currentUser");
      if (stored) await RedditCookies.saveRenewedSession(stored);
      await change();
    });

  const logInContext = async (username?: string): Promise<boolean | null> => {
    const attempt = ++sessionAttempt.current;
    try {
      resetGqlSessionState();
      if (username) {
        await swapSessionCookies(() =>
          RedditCookies.restoreSessionCookies(username),
        );
      }
      const user = await getCurrentUser();
      if (attempt !== sessionAttempt.current) return null;
      if (username && user.userName !== username) {
        throw new Error("Authenticated session out of sync");
      }
      UserAuth.isLoggedIn = true;
      KeyStore.set("currentUser", user.userName);
      setCurrentUser(user);
      Sentry.setUser({ username: user.userName });
      await RedditCookies.saveSessionCookies(user.userName);
      await addUser(user.userName);
      // Best effort: a failure here shouldn't log the user out.
      fixIncompatibleAccountSettings().catch((e) => Sentry.captureException(e));
      return true;
    } catch (e) {
      if (attempt !== sessionAttempt.current) return null;
      // safeFetch's network errors and timeouts. The session may be fine, so
      // the next launch tries the stored account again.
      if (
        username &&
        e instanceof TypeError &&
        e.message.startsWith("Network request")
      ) {
        Alert.alert(
          "Couldn't reach Reddit",
          "Check your connection, then choose your account in the Account tab.",
        );
        await logOutContext({ forget: false });
        return false;
      }
      // A new login (no username) reports its own failure.
      if (username) {
        Alert.alert(
          "Login Session Expired",
          "You can login again by pressing the + button in the top right corner of the Account tab.",
        );
      }
      await logOutContext();
      return false;
    }
  };

  const doWithTempLogout = async (fn: () => Promise<boolean>) => {
    const currentUser = KeyStore.getString("currentUser");
    const wasLoggedIn = UserAuth.isLoggedIn;
    UserAuth.isLoggedIn = false;
    await swapSessionCookies(() => RedditCookies.clearSessionCookies());
    const shouldRestore = await fn();
    if (!shouldRestore || !currentUser || !wasLoggedIn) return;
    if (KeyStore.getString("currentUser") === currentUser) {
      await swapSessionCookies(() =>
        RedditCookies.restoreSessionCookies(currentUser),
      );
      UserAuth.isLoggedIn = true;
    } else {
      // A failed login logged out, so the state has to come back too.
      await logInContext(currentUser);
    }
  };

  const logOutContext = async ({ forget = true } = {}) => {
    sessionAttempt.current++;
    UserAuth.isLoggedIn = false;
    await swapSessionCookies(() => RedditCookies.clearSessionCookies());
    if (forget) KeyStore.remove("currentUser");
    setCurrentUser(null);
    Sentry.setUser(null);
    resetGqlSessionState();
  };

  const addUser = async (username: string) => {
    const usernamesJSON = KeyStore.getString("usernames");
    let usernames: string[] = [];
    if (usernamesJSON) {
      usernames = JSON.parse(usernamesJSON);
    }
    if (usernames.includes(username)) {
      return;
    }
    const accs = [...accounts, username];
    await saveAccounts(accs);
    setAccounts(accs);
  };

  const removeUser = async (username: string) => {
    const accs = accounts.filter((acc) => acc !== username);
    if (KeyStore.getString("currentUser") === username) {
      await logOutContext();
    }
    // remove from saved data
    await RedditCookies.deleteSessionCookies(username);
    await saveAccounts(accs);
    setAccounts(accs);
  };

  const saveAccounts = async (accs: string[]) => {
    KeyStore.set("usernames", JSON.stringify(accs));
  };

  const loadSavedData = async () => {
    const usernamesJSON = KeyStore.getString("usernames");
    let currentUsername: string | null = null;
    if (usernamesJSON) {
      const usernames: string[] = JSON.parse(usernamesJSON);
      setAccounts(usernames);
      currentUsername = KeyStore.getString("currentUser") ?? null;
      if (currentUsername) {
        await logInContext(currentUsername);
      }
    }
    if (!currentUsername) {
      await logOutContext();
    }
    setLoginInitialized(true);
  };

  useEffect(() => {
    loadSavedData();
  }, []);

  return (
    <AccountContext.Provider
      value={{
        loginInitialized,
        currentUser,
        accounts,
        logIn: logInContext,
        logOut: logOutContext,
        removeUser,
        doWithTempLogout,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
