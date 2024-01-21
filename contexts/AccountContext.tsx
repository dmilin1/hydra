import { createContext, useState } from 'react';

type Account = {
    username: string,
    password: string,
}

type AccountContextType =  {
    currentAcc: Account|null,
    accounts: Account[],
}

const initialAccountContext: AccountContextType = {
    currentAcc: null,
    accounts: [],
};

export const AccountContext = createContext(initialAccountContext);

export function AccountProvider({ children }: React.PropsWithChildren) {
    const [currentAcc, setCurrentAcc] = useState<AccountContextType['currentAcc']>(null);
    const [accounts, setAccounts] = useState<AccountContextType['accounts']>([]);

    return (
        <AccountContext.Provider value={{
            currentAcc,
            accounts,
        }}>
            {children}
        </AccountContext.Provider>
    );
}