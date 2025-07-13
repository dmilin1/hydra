import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState } from "react";

import { getCurrentUser, UserAuth } from "../api/Authentication";
import { Account, User, getUser } from "../api/User";
import KeyStore from "../utils/KeyStore";
import RedditCookies from "../utils/RedditCookies";

type AccountContextType = {
  loginInitialized: boolean;
  currentUser: User | null;
  accounts: Account[];
  logIn: (account: Account) => Promise<void>;
  logOut: () => Promise<void>;
  addUser: (account: Account) => Promise<void>;
  removeUser: (account: Account) => Promise<void>;
};

const initialAccountContext: AccountContextType = {
  loginInitialized: false,
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
  const [currentUser, setCurrentUser] =
    useState<AccountContextType["currentUser"]>(null);
  const [accounts, setAccounts] = useState<AccountContextType["accounts"]>([]);

  const logInContext = async (account: Account): Promise<void> => {
    await RedditCookies.restoreSessionCookies(account);
    await getCurrentUser();
    const user = await getUser("/user/me");
    if (user.userName !== account.username) {
      await logOutContext();
      return;
    }
    KeyStore.set("currentUser", account.username);
    setCurrentUser(user);
    Sentry.setUser({ username: user.userName });
    await RedditCookies.saveSessionCookies(account);
  };

  const logOutContext = async () => {
    await RedditCookies.clearSessionCookies();
    KeyStore.delete("currentUser");
    setCurrentUser(null);
    Sentry.setUser(null);
    UserAuth.modhash = undefined;
  };

  const addUser = async (account: Account) => {
    await logInContext({
      username: account.username,
    });
    if (!accounts.find((acc) => acc.username === account.username)) {
      const accs = [...accounts, account];
      await saveAccounts(accs);
      setAccounts(accs);
    }
  };

  const removeUser = async (account: Account) => {
    const accs = accounts.filter((acc) => acc.username !== account.username);
    if (currentUser?.userName === account.username) {
      await logOutContext();
    }
    // remove from saved data
    await SecureStore.deleteItemAsync(`password-${account.username}`);
    await RedditCookies.deleteSessionCookies(account);
    await saveAccounts(accs);
    setAccounts(accs);
  };

  const saveAccounts = async (accs: Account[]) => {
    KeyStore.set("usernames", JSON.stringify(accs.map((acc) => acc.username)));
  };

  const loadSavedData = async () => {
    const usernamesJSON = KeyStore.getString("usernames");
    const accs: AccountContextType["accounts"] = [];
    if (usernamesJSON) {
      const usernames: string[] = JSON.parse(usernamesJSON);
      accs.push(...usernames.map((username) => ({ username })));
      setAccounts(accs);
      const currentUsername = KeyStore.getString("currentUser");
      const currentAccount = accs.find(
        (acc) => acc.username === currentUsername,
      );
      if (currentUsername && currentAccount) {
        await logInContext(currentAccount);
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
