import 'react-native-url-polyfill/auto'
import { api } from "./RedditApi";
import { Subreddit, formatSubredditData } from './Subreddits';
import { Post, formatPostData } from './Posts';

export const SearchTypes = ['posts', 'subreddits', 'users'] as const;
export type SearchType = typeof SearchTypes[number];

type SearchOptions = {
    sort?: string,
    time?: 'all' | 'year' | 'month' | 'week' | 'day' | 'hour',
}

async function search(type: SearchType, text: string, options: SearchOptions = {}) {
    const searchParams = new URLSearchParams(options);
    const typeMap = {
        'posts': 'link',
        'subreddits': 'sr',
        'users': 'user',
    };
    return await api(`https://www.reddit.com/search/.json?type=${typeMap[type]}&q=${text}&${searchParams.toString()}`, {});
}

export async function searchPosts(text: string, options: SearchOptions = {}): Promise<Post[]> {
    const results = await search('posts', text, options);
    const posts = results.data.children.map((child: any) => formatPostData(child));
    return posts;
}

export async function searchSubreddits(text: string, options: SearchOptions = {}): Promise<Subreddit[]> {
    const results = await search('subreddits', text, options);
    const subreddits = results.data.children.map((child: any) => formatSubredditData(child));
    return subreddits;
}