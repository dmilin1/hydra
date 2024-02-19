import 'react-native-url-polyfill/auto'
import { api } from "./RedditApi";
import Time from '../utils/Time';
import RedditURL from '../utils/RedditURL';
import { decode } from 'html-entities';

export type CommentReply = {
    id: string,
    type: 'commentReply',
    author: string,
    upvotes: number,
    postTitle: string,
    contextLink: string,
    subreddit: string,
    html: string,
    after: string,
    createdAt: number,
    timeSince: string,
}

export function formatCommentReply(data: any): CommentReply {
    return {
        id: data.id,
        type: 'commentReply',
        author: data.author,
        upvotes: data.score,
        postTitle: data.link_title,
        contextLink: data.context,
        subreddit: data.subreddit,
        html: decode(data.body_html),
        after: data.name,
        createdAt: data.created,
        timeSince: new Time(data.created * 1000).prettyTimeSince() + ' ago',
    }
}

export async function getInbox(): Promise<CommentReply[]> {
    const redditURL = new RedditURL('https://www.reddit.com/message/inbox');
    redditURL.setQueryParams({});
    redditURL.jsonify();
    const response = await api(redditURL.toString());
    return response.data.children
        .filter((child: any) => child.kind === 't1')
        .map((child: any) => formatCommentReply(child.data));
}
