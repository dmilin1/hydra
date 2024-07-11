import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState } from "react";

import { getCurrentUser, login, logout, Needs2FA } from "../api/Authentication";
import { User, getUser } from "../api/User";

export type Account = {
  username: string;
  password: string;
};

type AccountContextType = {
  loginInitialized: boolean;
  currentAcc: Account | null;
  currentUser: User | null;
  accounts: Account[];
  needs2FA: boolean;
  logIn: (account: Account) => Promise<boolean>;
  logOut: () => Promise<void>;
  addUser: (account: Account, twoFACode: string) => Promise<boolean>;
  removeUser: (account: Account) => Promise<void>;
};

const initialAccountContext: AccountContextType = {
  loginInitialized: false,
  currentAcc: null,
  currentUser: null,
  needs2FA: false,
  accounts: [],
  logIn: async () => false,
  logOut: async () => { },
  addUser: async () => false,
  removeUser: async () => { },
};

export const AccountContext = createContext(initialAccountContext);

export function AccountProvider({ children }: React.PropsWithChildren) {
  const [loginInitialized, setLoginInitialized] = useState(false);
  const [currentAcc, setCurrentAcc] =
    useState<AccountContextType["currentAcc"]>(null);
  const [currentUser, setCurrentUser] =
    useState<AccountContextType["currentUser"]>(null);
  const [accounts, setAccounts] = useState<AccountContextType["accounts"]>([]);
  const [needs2FA, setNeeds2FA] = useState(false);

  const logInContext = async (account: Account): Promise<boolean> => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser?.data?.name !== account.username) {
        await login(account);
      }
      const user = await getUser("/u/me");
      await AsyncStorage.setItem("currentUser", account.username);
      setCurrentAcc(account);
      setCurrentUser(user);
      setNeeds2FA(false);
      return true;
    } catch (e) {
      if (e instanceof Needs2FA) {
        setNeeds2FA(true);
        throw e;
      }
      alert("Incorrect username or password");
      return false;
    }
  };

  const logOutContext = async () => {
    await logout();
    await AsyncStorage.removeItem("currentUser");
    setCurrentAcc(null);
    setCurrentUser(null);
    setNeeds2FA(false);
  };

  const addUser = async (
    account: Account,
    twoFACode: string,
  ): Promise<boolean> => {
    if (accounts.find((acc) => acc.username === account.username)) {
      alert("Account already added");
      return false;
    }
    if (
      await logInContext({
        username: account.username,
        password: account.password + (twoFACode ? `:${twoFACode}` : ""),
      })
    ) {
      const accs = [...accounts, account];
      await saveAccounts(accs);
      setAccounts(accs);
      return true;
    }
    return false;
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
        currentAcc,
        currentUser,
        needs2FA,
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
