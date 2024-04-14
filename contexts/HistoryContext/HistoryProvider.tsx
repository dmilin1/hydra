import React, { useState } from 'react';
import PostsPage from '../../pages/PostsPage';
import RedditURL, { PageType } from '../../utils/RedditURL';
import ErrorPage from '../../pages/ErrorPage';
import Page from '../../pages';
import PostDetails from '../../pages/PostDetails';
import UserPage from '../../pages/UserPage';
import AccountsPage from '../../pages/AccountsPage';
import SettingsPage from '../../pages/SettingsPage';
import { HistoryProviderProps, initialHistory, HistoryLayer, HistoryContext } from '.';

/**
 * This provider is in its own file in order to avoid circular dependencies.
 */

export function HistoryProvider({
    initialPast = [], initialFuture = [], children
}: HistoryProviderProps
) {
    const [past, setPast] = useState<typeof initialHistory.past>(initialPast);
    const [future, setFuture] = useState<typeof initialHistory.future>(initialFuture);

    const pushPath = (path: string) => {
        let name = (new RedditURL(path)).getPageName();
        let Page: Page = ErrorPage;
        const pageType = (new RedditURL(path)).getPageType();
        if (pageType === PageType.HOME) {
            Page = PostsPage;
        } else if (pageType === PageType.SUBREDDIT) {
            Page = PostsPage;
        } else if (pageType === PageType.POST_DETAILS) {
            Page = PostDetails;
        } else if (pageType === PageType.USER) {
            Page = UserPage;
        } else if (pageType === PageType.ACCOUNTS) {
            Page = AccountsPage;
        } else if (pageType === PageType.SETTINGS) {
            Page = SettingsPage;
        }
        setPast([...past, {
            elem: (
                <Page
                    url={path}
                    key={Math.random()} // Need key or element won't be treated as new
                />
            ),
            name,
        }]);
        setFuture([]);
    };

    const pushLayer = (layer: HistoryLayer) => {
        setPast([...past, layer]);
        setFuture([]);
    };

    const reload = () => {
        const currentPath = past.slice(-1)[0]?.elem.props.path ?? '';
        backward();
        pushPath(currentPath);
    };

    const replace = (path: string) => {
        backward();
        pushPath(path);
    };

    const forward = () => {
        const popped = future.pop();
        if (popped) {
            setPast([...past, popped]);
            return popped;
        }
    };

    const backward = () => {
        const popped = past.pop();
        if (popped) {
            setFuture([...future, popped]);
            return popped;
        }
    };

    return (
        <HistoryContext.Provider value={{
            past,
            future,
            setPast,
            setFuture,
            pushLayer,
            pushPath,
            reload,
            replace,
            forward,
            backward,
        }}>
            {children}
        </HistoryContext.Provider>
    );
}
