import 'react-native-url-polyfill/auto'
import { api } from "./RedditApi";
import Time from '../utils/Time';
import RedditURL from '../utils/RedditURL';
import { decode } from 'html-entities';
import { VoteOption } from './PostDetail';

export type CommentReply = {
    id: string,
    name: string,
    type: 'commentReply',
    author: string,
    upvotes: number,
    userVote: VoteOption,
    new: boolean,
    postTitle: string,
    contextLink: string,
    subreddit: string,
    html: string,
    after: string,
    createdAt: number,
    timeSince: string,
}

export function formatCommentReply(data: any): CommentReply {
    let userVote = VoteOption.NoVote;
    if (data.likes === true) {
        userVote = VoteOption.UpVote;
    } else if (data.likes === false) {
        userVote = VoteOption.DownVote;
    }
    return {
        id: data.id,
        name: data.name,
        type: 'commentReply',
        author: data.author,
        upvotes: data.score,
        userVote,
        new: data.new,
        postTitle: data.link_title,
        contextLink: data.context,
        subreddit: data.subreddit,
        html: decode(data.body_html),
        after: data.name,
        createdAt: data.created,
        timeSince: new Time(data.created * 1000).prettyTimeSince() + ' ago',
    }
}

type MessagesOptions = {
    sort?: string,
    limit?: string,
    after?: string,
}

export async function getMessages(options: MessagesOptions = {}): Promise<CommentReply[]> {
    const redditURL = new RedditURL('https://www.reddit.com/message/inbox');
    redditURL.setQueryParams({
        ...options,
    });
    redditURL.jsonify();
    const response = await api(redditURL.toString(), {}, { requireAuth: true });
    return response.data.children
        .filter((child: any) => child.kind === 't1')
        .map((child: any) => formatCommentReply(child.data));
}

export async function setReadStatus(message: CommentReply, isRead: boolean): Promise<void> {
    const res = await api(`https://www.reddit.com/api/${isRead ? 'read_message' : 'unread_message'}`, {
        method: 'POST',
    }, {
        requireAuth: true,
        body: {
            id: message.name,
        },
    });
    console.log(res);
}