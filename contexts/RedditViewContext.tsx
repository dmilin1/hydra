import { createContext, useState } from 'react';
import WebView from 'react-native-webview';

export type Post = {
    title: string,
    postLink: string,
    subredditImg: string,
    subreddit: string,
    images: string[],
    bodyText: string,
    video: string,
    externalLink: string,
    author: string,
    voteCount: string,
    commentCount: string,
    timeSincePost: string,
    isAd: boolean,
    scrollTo: () => void,
    upvote: () => void,
    downvote: () => void,
    contextMenu: () => void,
}

const initialContext = {
    posts: [] as Post[],
    setPosts: (posts: Post[]) => {},
    webview: null as WebView|null,
    setWebview: (webview: WebView|null) => {},
};

export type RedditViewContextType = typeof initialContext;

export const RedditViewContext = createContext(initialContext);

export function RedditViewProvider({ children }: React.PropsWithChildren) {
    const [posts, setPosts] = useState(initialContext.posts);
    const [webview, setWebview] = useState(initialContext.webview);

    return (
        <RedditViewContext.Provider value={{
            posts,
            setPosts,
            webview,
            setWebview,
        }}>
            {children}
        </RedditViewContext.Provider>
    );
}