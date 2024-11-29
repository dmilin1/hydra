import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  IncorrectCredentials,
  login,
  logout,
  Needs2FA,
  RateLimited,
} from "../api/Authentication";
import { User, getUser } from "../api/User";
import RedditCookies from "../utils/RedditCookies";

export type Account = {
  username: string;
  password: string;
};

type AccountContextType = {
  loginInitialized: boolean;
  currentAcc: Account | null;
  currentUser: User | null;
  accounts: Account[];
  logIn: (account: Account) => Promise<void>;
  logOut: () => Promise<void>;
  addUser: (account: Account, twoFACode: string) => Promise<void>;
  removeUser: (account: Account) => Promise<void>;
};

const initialAccountContext: AccountContextType = {
  loginInitialized: false,
  currentAcc: null,
  currentUser: null,
  accounts: [],
  logIn: async () => {},
  logOut: async () => {},
  addUser: async () => {},
  removeUser: async () => {},
};

export const AccountContext = createContext(initialAccountContext);

export function AccountProvider({ children }: React.PropsWithChildren) {
  const [loginInitialized, setLoginInitialized] = useState(false);
  const [currentAcc, setCurrentAcc] =
    useState<AccountContextType["currentAcc"]>(null);
  const [currentUser, setCurrentUser] =
    useState<AccountContextType["currentUser"]>(null);
  const [accounts, setAccounts] = useState<AccountContextType["accounts"]>([]);

  const logInContext = async (account: Account, attempt = 1): Promise<void> => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser?.data?.name !== account.username) {
        await login(account);
      }
      const user = await getUser("/user/me");
      await AsyncStorage.setItem("currentUser", account.username);
      setCurrentAcc(account);
      setCurrentUser(user);
      Sentry.setUser({ username: user.userName });
    } catch (e) {
      if (e instanceof RateLimited && attempt === 1) {
        // This error seems to happen when the session cookies are stale, but
        // I'm not sure why that's the case. Clearing the cookies and trying
        // again seems to fix it.
        RedditCookies.clearSessionCookies();
        return logInContext(account, attempt + 1);
      }
      if (!(e instanceof Needs2FA) && !(e instanceof IncorrectCredentials)) {
        alert("Unexpected error logging in:" + e);
      }
      throw e;
    }
  };

  const logOutContext = async () => {
    await logout();
    await AsyncStorage.removeItem("currentUser");
    setCurrentAcc(null);
    setCurrentUser(null);
    Sentry.setUser(null);
  };

  const addUser = async (account: Account, twoFACode: string) => {
    if (accounts.find((acc) => acc.username === account.username)) {
      alert("Account already added");
      return;
    }
    await logInContext({
      username: account.username,
      password: account.password + (twoFACode ? `:${twoFACode}` : ""),
    });
    const accs = [...accounts, account];
    await saveAccounts(accs);
    setAccounts(accs);
  };

  const removeUser = async (account: Account) => {
    const accs = accounts.filter((acc) => acc.username !== account.username);
    if (currentAcc?.username === account.username) {
      await logOutContext();
    }
    // remove from saved data
    await SecureStore.deleteItemAsync(`password-${account.username}`);
    await saveAccounts(accs);
    setAccounts(accs);
  };

  const saveAccounts = async (accs: Account[]) => {
    await AsyncStorage.setItem(
      "usernames",
      JSON.stringify(accs.map((acc) => acc.username)),
    );
    await Promise.all(
      accs.map(async (acc) =>
        SecureStore.setItemAsync(`password-${acc.username}`, acc.password),
      ),
    );
  };

  const loadSavedData = async () => {
    const usernamesJSON = await AsyncStorage.getItem("usernames");
    const accs: AccountContextType["accounts"] = [];
    if (usernamesJSON) {
      const usernames: string[] = JSON.parse(usernamesJSON);
      await Promise.all(
        usernames.map(async (username) =>
          SecureStore.getItemAsync(`password-${username}`).then((password) => {
            if (password) {
              accs.push({ username, password });
            }
          }),
        ),
      );
      const currentUsername = await AsyncStorage.getItem("currentUser");
      const currentAccount = accs.find(
        (acc) => acc.username === currentUsername,
      );
      if (currentUsername && currentAccount) {
        try {
          await logInContext(currentAccount);
        } catch (e) {
          if (e instanceof Needs2FA || e instanceof IncorrectCredentials) {
            await logOutContext();
            alert("Your login session has expired. Please log in again.");
          } else {
            alert(`Unknown error when logging in: ${e}`);
          }
        }
      }
      setAccounts(accs);
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
        currentAcc,
        currentUser,
        accounts,
        logIn: logInContext,
        logOut: logOutContext,
        addUser,
        removeUser,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
