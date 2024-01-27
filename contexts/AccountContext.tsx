import { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { login, logout } from '../api/Authentication';
import { User, getUser } from '../api/User';
import Login from '../components/Modals/Login';

export type Account = {
    username: string,
    password: string,
}

type AccountContextType =  {
    currentAcc: Account|null,
    currentUser: User|null,
    accounts: Account[],
    setShowLoginModal: (visible: boolean) => void,
    logIn: (account: Account) => Promise<boolean>,
    logOut: () => Promise<void>,
    addUser: (account: Account) => Promise<boolean>,
    removeUser: (account: Account) => Promise<void>,
}

const initialAccountContext: AccountContextType = {
    currentAcc: null,
    currentUser: null,
    accounts: [],
    setShowLoginModal: () => {},
    logIn: async () => false,
    logOut: async () => {},
    addUser: async () => false,
    removeUser: async () => {},
};

export const AccountContext = createContext(initialAccountContext);

export function AccountProvider({ children }: React.PropsWithChildren) {
    const [currentAcc, setCurrentAcc] = useState<AccountContextType['currentAcc']>(null);
    const [currentUser, setCurrentUser] = useState<AccountContextType['currentUser']>(null);
    const [accounts, setAccounts] = useState<AccountContextType['accounts']>([]);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const logInContext = async (account: Account): Promise<boolean> => {
        try {
            await login(account);
            const user = await getUser('/u/me');
            await AsyncStorage.setItem('currentUser', account.username);
            setCurrentAcc(account);
            setCurrentUser(user);
            return true;
        } catch (e) {
            alert('Incorrect username or password');
            return false;
        }
    }

    const logOutContext = async () => {
        await logout();
        await AsyncStorage.removeItem('currentUser');
        setCurrentAcc(null);
        setCurrentUser(null);
    }

    const addUser = async (account: Account): Promise<boolean> => {
        if (accounts.find(acc => acc.username === account.username)) {
            alert('Account already added');
            return false;
        }
        if (await logInContext(account)) {
            const accs = [...accounts, account];
            await saveAccounts(accs);
            setAccounts(accs);
            return true;
        }
        return false;
    }

    const removeUser = async (account: Account) => {
        const accs = accounts.filter(acc => acc.username !== account.username);
        if (currentAcc?.username === account.username) {
            await logOutContext();
        }
        // remove from saved data
        await SecureStore.deleteItemAsync(`password-${account.username}`);
        await saveAccounts(accs);
        setAccounts(accs);
    }

    const saveAccounts = async (accs: Account[]) => {
        await AsyncStorage.setItem('usernames', JSON.stringify(accs.map(acc => acc.username)));
        await Promise.all(accs.map(async (acc) => 
            SecureStore.setItemAsync(`password-${acc.username}`, acc.password)
        ));
    }

    const loadSavedData = async () => {
        const usernamesJSON = await AsyncStorage.getItem('usernames');
        const accs: AccountContextType['accounts'] = [];
        if (usernamesJSON) {
            const usernames: string[] = JSON.parse(usernamesJSON);
            await Promise.all(usernames.map(async (username) => 
                SecureStore.getItemAsync(`password-${username}`).then((password) => {
                    if (password) {
                        accs.push({ username, password });
                    }
                })
            ));
            const currentUsername = await AsyncStorage.getItem('currentUser');
            const currentAccount = accs.find(acc => acc.username === currentUsername);
            if (currentUsername && currentAccount) {
                await logInContext(currentAccount);
            }
            setAccounts(accs);
        }
    }

    useEffect(() => {
        loadSavedData();
    }, []);

    return (
        <AccountContext.Provider value={{
            currentAcc,
            currentUser,
            accounts,
            setShowLoginModal,
            logIn: logInContext,
            logOut: logOutContext,
            addUser,
            removeUser,
        }}>
            <Login
                visible={showLoginModal}
                setVisible={setShowLoginModal}
            />
            {children}
        </AccountContext.Provider>
    );
}