import React, { createContext, useState } from 'react';
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import RedditView from '../components/RedditView';

export type HistoryLayer = {
    elem: JSX.Element,
    name: string,
}

const initialHistory : {
    past: HistoryLayer[],
    future: HistoryLayer[],
    pushLayer: (route: HistoryLayer) => void,
    pushPath: (path: string) => void,
    reload: () => void,
    replace: (path: string) => void,
    forward: () => HistoryLayer | void,
    backward: () => HistoryLayer | void,
} = {
    past: [],
    future: [],
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
        let name = '';
        if (path === '' || path === '/') {
            name = 'Home';
        } else if (path.startsWith('/r/')) {
            name = path.slice(3).split(/\/|\?/)[0];
        } else if (path.startsWith('/u/')) {
            name = path.slice(3).split(/\/|\?/)[0];
        }
        name = name.charAt(0).toUpperCase() + name.slice(1);
        setPast([...past, {
            elem: (
                <RedditView
                    path={path}
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