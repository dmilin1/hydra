import { ReactNode, createContext, useEffect, useState } from 'react';

export type Account = {
    username: string,
    password: string,
}

type AccountContextType =  {
    setModal: (modal?: ReactNode) => void,
}

const initialModalContext: AccountContextType = {
    setModal: () => {},
};

export const ModalContext = createContext(initialModalContext);

export function ModalProvider({ children }: React.PropsWithChildren) {
    const [modal, setModal] = useState<ReactNode>(null);

    return (
        <ModalContext.Provider value={{
            setModal,
        }}>
            {modal}
            {children}
        </ModalContext.Provider>
    );
}