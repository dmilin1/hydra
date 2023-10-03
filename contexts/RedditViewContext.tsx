import { createContext, useState } from 'react';
import WebView from 'react-native-webview';

export type Post = {
    title: string,
    postLink: string,
    subredditImg: string,
    subreddit: string,
    images: string[],
    bodyHTML: string,
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

export type Comment = {
    id: string,
    depth: number,
    text: string,
    author: string,
    timeSinceComment: string,
    voteCount: string,
    currentVote: 1 | 0 | -1,
    loadMoreText?: string,
    children: Comment[],
    upVote: () => void,
    downVote: () => void,
    loadMore: () => void,
}

const initialContext = {
    posts: [] as Post[],
    setPosts: (posts: Post[]) => {},
    postDetails: null as Post|null,
    setPostDetails: (postDetails: Post|null) => {},
    comments: [] as Comment[],
    setComments: (comments: Comment[]) => {},
    webview: null as WebView|null,
    setWebview: (webview: WebView|null) => {},
};

export type RedditViewContextType = typeof initialContext;

export const RedditViewContext = createContext(initialContext);

export function RedditViewProvider({ children }: React.PropsWithChildren) {
    const [posts, setPosts] = useState(initialContext.posts);
    const [postDetails, setPostDetails] = useState(initialContext.postDetails);
    const [comments, setComments] = useState(initialContext.comments);
    const [webview, setWebview] = useState(initialContext.webview);

    return (
        <RedditViewContext.Provider value={{
            posts,
            setPosts,
            postDetails,
            setPostDetails,
            comments,
            setComments,
            webview,
            setWebview,
        }}>
            {children}
        </RedditViewContext.Provider>
    );
}