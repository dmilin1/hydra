import React, { createContext, useContext, useState } from 'react';
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import WebViewer from '../components/WebViewer';
import WebView from 'react-native-webview';
import { HistoryContext } from './HistoryContext';

const initialContext : {
    webviewers: {
        [id: string]: {
            elem: JSX.Element,
            contextSubscribers: any[],
            webview: { elem: WebView|null },
        },
    },
    addWebviewer: (id: string, path: string) => void,
    deleteWebviewer: (id: string) => void,
    subscribeToWebviewer: (id: string, subscriber: any) => void,
    getCurrentWebview: () => WebView|null,
} = {
    webviewers: {},
    addWebviewer: () => {},
    deleteWebviewer: () => {},
    subscribeToWebviewer: () => {},
    getCurrentWebview: () => null,
};

export type WebviewersProviderProps = {
    children?: JSX.Element,
}

export const WebviewersContext = createContext(initialContext);

export function WebviewersProvider({ children } : WebviewersProviderProps) {
    const history = useContext(HistoryContext);

    const [webviewers, setWebviewers] = useState<typeof initialContext.webviewers>({});

    const addWebviewer = (id: string, path: string) => {
        if (webviewers[id]) {
            return;
        };
        const webviewContainer = { elem: null };
        setWebviewers((webviewers) => ({
            ...webviewers,
            [id]: {
                elem: <WebViewer key={id} id={id} path={path} webviewRef={webviewContainer}/>,
                contextSubscribers: [],
                webview: webviewContainer,
            }
        }));
    }

    const subscribeToWebviewer = (id: string, subscriber: any) => {
        setWebviewers((webviewers) => {
            const newWebviewers = { ...webviewers };
            newWebviewers[id].contextSubscribers.push(subscriber);
            return newWebviewers;
        });
    }

    const deleteWebviewer = (id: string) => {
        setWebviewers((webviewers) => {
            const newWebviewers = { ...webviewers };
            delete newWebviewers[id];
            return newWebviewers;
        });
    }

    const getCurrentWebview = () => {
        const key = history.getCurrentWebviewerKey();
        if (!key) return null;
        const webviewer = webviewers[key];
        return webviewer.webview.elem;
    }

    const cleanUnusedWebviewers = () => {
        const expectedWebviewerKeys = [...history.past, ...history.future].map(layer => {
            return layer.elem.props.webviewerKey;
          });
          const actualWebviewerKeys = Object.keys(webviewers);
          const keysToRemove = actualWebviewerKeys.filter(key => !expectedWebviewerKeys.includes(key));
          for (const key of keysToRemove) {
            deleteWebviewer(key);
          }
    }

    cleanUnusedWebviewers();

    return (
        <WebviewersContext.Provider value={{
            webviewers,
            addWebviewer,
            deleteWebviewer,
            subscribeToWebviewer,
            getCurrentWebview,
        }}>
            {children}
        </WebviewersContext.Provider>
    );
}

export function t(style1: ViewStyle | TextStyle | ImageStyle, style2: any) {
    return StyleSheet.compose(style1, style2);
}