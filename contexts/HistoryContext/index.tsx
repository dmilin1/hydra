import { createContext } from 'react';
import { ImageStyle, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

export type HistoryLayer = {
    elem: JSX.Element,
    name: string,
}

export const initialHistory : {
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

export function t(style1: ViewStyle | TextStyle | ImageStyle, style2: any) {
    return StyleSheet.compose(style1, style2);
}