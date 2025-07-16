import * as Sentry from "@sentry/react-native";
import { createContext, useEffect, useState } from "react";

import { UserAuth } from "../api/Authentication";
import { User, getUser } from "../api/User";
import KeyStore from "../utils/KeyStore";
import RedditCookies from "../utils/RedditCookies";

type AccountContextType = {
  loginInitialized: boolean;
  currentUser: User | null;
  accounts: string[];
  logIn: (username?: string) => Promise<boolean>;
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

  const logInContext = async (username?: string): Promise<boolean> => {
    if (username) {
      await RedditCookies.restoreSessionCookies(username);
    }
    try {
      const user = await getUser("/user/me");
      if (username && user.userName !== username) {
        throw new Error("Authenticated session out of sync");
      }
      if (!user.modhash) {
        throw new Error("Failed to get modhash");
      }
      UserAuth.modhash = user.modhash;
      KeyStore.set("currentUser", user.userName);
      setCurrentUser(user);
      Sentry.setUser({ username: user.userName });
      await RedditCookies.saveSessionCookies(user.userName);
      await addUser(user.userName);
      return true;
    } catch (_e) {
      await logOutContext();
      return false;
    }
  };

  const doWithTempLogout = async (fn: () => Promise<boolean>) => {
    const currentUser = KeyStore.getString("currentUser");
    const currentUserModhash = UserAuth.modhash;
    await RedditCookies.clearSessionCookies();
    UserAuth.modhash = undefined;
    const shouldRestore = await fn();
    if (shouldRestore && currentUser && currentUserModhash) {
      await RedditCookies.restoreSessionCookies(currentUser);
      UserAuth.modhash = currentUserModhash;
    }
  };

  const logOutContext = async () => {
    await RedditCookies.clearSessionCookies();
    KeyStore.delete("currentUser");
    setCurrentUser(null);
    Sentry.setUser(null);
    UserAuth.modhash = undefined;
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
    if (currentUser?.userName === username) {
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
    if (usernamesJSON) {
      const usernames: string[] = JSON.parse(usernamesJSON);
      setAccounts(usernames);
      const currentUsername = KeyStore.getString("currentUser");
      await logInContext(currentUsername);
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
