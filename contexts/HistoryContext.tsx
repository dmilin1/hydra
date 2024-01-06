import React, { createContext, useState } from 'react';
import { ImageStyle, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import Posts from '../pages/Posts';
import RedditURL, { PageType } from '../utils/RedditURL';
import ErrorPage from '../pages/ErrorPage';
import Page from '../pages';
import PostDetails from '../pages/PostDetails';
import AccountPage from '../pages/AccountPage';

export type HistoryLayer = {
    elem: JSX.Element,
    name: string,
}

const initialHistory : {
    past: HistoryLayer[],
    future: HistoryLayer[],
    setPast: (past: HistoryLayer[]) => void,
    setFuture: (future: HistoryLayer[]) => void,
    pushLayer: (route: HistoryLayer) => void,
    pushPath: (path: string) => void,
    reload: () => void,
    replace: (path: string) => void,
    forward: () => HistoryLayer | void,
    backward: () => HistoryLayer | void,
} = {
    past: [],
    future: [],
    setPast: () => {},
    setFuture: () => {},
    pushLayer: () => {},
    pushPath: () => {},
    reload: () => {},
    replace: () => {},
    forward: () => {},
    backward: () => {},
};

export type HistoryProviderProps = {
    initialPast?: typeof initialHistory.past,
    initialFuture?: typeof initialHistory.future,
    children?: JSX.Element,
}

export const HistoryContext = createContext(initialHistory);

export function HistoryProvider({
        initialPast = [],
        initialFuture = [],
        children
    } : HistoryProviderProps
) {
    const [past, setPast] = useState<typeof initialHistory.past>(initialPast);
    const [future, setFuture] = useState<typeof initialHistory.future>(initialFuture);

    const pushPath = (path: string) => {
        let name = (new RedditURL(path)).getPageName();
        let Page: Page = ErrorPage;
        const pageType = (new RedditURL(path)).getPageType();
        if (pageType === PageType.HOME) {
            Page = Posts;
        } else if (pageType === PageType.SUBREDDIT) {
            Page = Posts;
        } else if (pageType === PageType.POST_DETAILS) {
            Page = PostDetails;
        } else if (pageType === PageType.USER) {
            Page = AccountPage;
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
    }

    const pushLayer = (layer: HistoryLayer) => {
        setPast([...past, layer]);
        setFuture([]);
    }

    const reload = () => {
        const currentPath = past.slice(-1)[0]?.elem.props.path ?? '';
        backward();
        pushPath(currentPath);
    }

    const replace = (path: string) => {
        backward();
        pushPath(path);
    }

    const forward = () => {
        const popped = future.pop();
        if (popped) {
            setPast([...past, popped]);
            return popped;
        }
    }

    const backward = () => {
        const popped = past.pop();
        if (popped) {
            setFuture([...future, popped]);
            return popped;
        }
    }

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

export function t(style1: ViewStyle | TextStyle | ImageStyle, style2: any) {
    return StyleSheet.compose(style1, style2);
}