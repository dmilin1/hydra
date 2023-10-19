import { createContext, useState } from 'react';

export type SubscriptionList = {
    [category: string]: [{
        subreddit: string,
        url: string,
    }]
}

const initialContext = {
    type: 'globalContext',
    subscriptionList: {} as SubscriptionList,
    setSubscriptionList: (subscriptionList: SubscriptionList) => {},
};

export type RedditGlobalContextType = typeof initialContext;

export const RedditGlobalContext = createContext(initialContext);

export function RedditGlobalProvider({ children }: React.PropsWithChildren) {
    const [subscriptionList, setSubscriptionList] = useState<SubscriptionList>({});

    return (
        <RedditGlobalContext.Provider value={{
            type: 'globalContext',
            subscriptionList,
            setSubscriptionList,
        }}>
            {children}
        </RedditGlobalContext.Provider>
    );
}