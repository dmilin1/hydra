import 'react-native-url-polyfill/auto'
import { decode } from 'html-entities';
import { api } from "./RedditApi";
import Time from '../utils/Time';
import RedditURL from '../utils/RedditURL';

export type Poll = {
    voteCount: number,
    options: {
        id: string,
        text: string,
    }[],
}

export type Post = {
    id: string,
    type: 'post',
    title: string,
    author: string,
    upvotes: number,
    subreddit: string,
    text: string,
    html: string,
    commentCount: number,
    link: string,
    images: string[],
    imageThumbnail: string,
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

export function formatPostData(child: any): Post {
    let externalLink = undefined;
    try {
        new RedditURL(child.data.url);
    } catch (e) {
        externalLink = child.data.url;
    }
    
    let images = Object.values(child.data.media_metadata ?? {}).map((data : any) => 
        data.s?.u?.replace(/&amp;/g, '&')
    ).filter(img => img !== undefined);
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
        type: 'post',
        title: child.data.title,
        author: child.data.author,
        upvotes: child.data.ups,
        subreddit: child.data.subreddit,
        text: child.data.selftext,
        html: decode(child.data.body_html),
        commentCount: child.data.num_comments,
        link: `https://www.reddit.com${child.data.permalink}`,
        images: images,
        imageThumbnail: child.data.thumbnail,
        video: child.data.media?.reddit_video?.fallback_url,
        poll: poll,
        externalLink,
        createdAt: child.data.created,
        timeSincePost: new Time(child.data.created * 1000).prettyTimeSince() + ' ago',
        after: child.data.name,
    }
}

export async function getPosts(url: string, options: GetPostOptions = {}): Promise<Post[]> {
    const redditURL = new RedditURL(url);
    redditURL.changeQueryParam('limit', String(options?.limit ?? 10));
    redditURL.changeQueryParam('after', options?.after ?? '');
    redditURL.jsonify();
    const response = await api(redditURL.toString());
    const posts : Post[] = response.data.children.map((child : any) => formatPostData(child));
    return posts;
}