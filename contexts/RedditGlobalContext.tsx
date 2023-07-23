import { createContext, useState } from 'react';

export type SubscriptionList = {
    [category: string]: [{
        subreddit: string,
        url: string,
    }]
}

const initialContext = {
    subscriptionList: {} as SubscriptionList,
    setSubscriptionList: (subscriptionList: SubscriptionList) => {},
};

export type RedditGlobalContextType = typeof initialContext;

export const RedditGlobalContext = createContext(initialContext);

export function RedditGlobalProvider({ children }: React.PropsWithChildren) {
    const [subscriptionList, setSubscriptionList] = useState<SubscriptionList>({});

    return (
        <RedditGlobalContext.Provider value={{
            subscriptionList,
            setSubscriptionList,
        }}>
            {children}
        </RedditGlobalContext.Provider>
    );
}