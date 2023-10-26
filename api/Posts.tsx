import 'react-native-url-polyfill/auto'
import { api } from "./RedditApi";
import Time from '../utils/Time';

export type Poll = {
    voteCount: number,
    options: {
        id: string,
        text: string,
    }[],
}

export type Post = {
    id: string,
    title: string,
    author: string,
    upvotes: number,
    subreddit: string,
    text: string,
    commentCount: number,
    link: string,
    images: string[],
    video: string|undefined,
    poll: Poll|undefined,
    externalLink: string|undefined,
    createdAt: number,
    timeSincePost: string,
    after: string,
}

type GetPostOptions = {
    limit?: number,
    after?: string,
}

export async function getPosts(url: string, options: GetPostOptions = {}): Promise<Post[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', String(options?.limit ?? 10));
    searchParams.set('after', options?.after ?? '');
    const response = await api(`${url}.json?${searchParams.toString()}`);
    const posts : Post[] = response.data.children.map((child : any) => {
        let externalLink = undefined;
        const hostname = (new URL(child.data.url)).host;
        if (!hostname.includes('reddit.com') && !hostname.includes('redd.it')) {
            externalLink = child.data.url;
        }
        let images = Object.values(child.data.media_metadata ?? {}).map((data : any) => 
            data.s.u.replace(/&amp;/g, '&')
        );
        if (images.length === 0 && child.data.post_hint === 'image') {
            images = [child.data.url];
        }
        let poll = undefined;
        if (child.data.poll_data) {
            poll = {
                voteCount: child.data.poll_data.total_vote_count,
                options: child.data.poll_data.options,
            }
        }
        return {
            id: child.data.id,
            title: child.data.title,
            author: child.data.author,
            upvotes: child.data.ups,
            subreddit: child.data.subreddit,
            text: child.data.selftext,
            commentCount: child.data.num_comments,
            link: `https://www.reddit.com${child.data.permalink}`,
            images: images,
            video: child.data.media?.reddit_video?.fallback_url,
            poll: poll,
            externalLink,
            createdAt: child.data.created,
            timeSincePost: new Time(child.data.created * 1000).prettyTimeSince(),
            after: child.data.name,
        }
    });
    return posts;
}