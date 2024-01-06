import 'react-native-url-polyfill/auto'
import { api } from "./RedditApi";
import Time from '../utils/Time';
import RedditURL from '../utils/RedditURL';
import { Post, formatPostData } from './Posts';
import { Comment, formatComments } from './PostDetail';

export type User = {
    id: string,
    type: 'user',
    userName: string,
    commentKarma: number,
    postKarma: number,
    icon: string,
    mailCount?: number,
    friends: boolean,
    isLoggedInUser: boolean,
    after: string,
    createdAt: number,
    timeSinceCreated: string,
}

export type UserContent = Post|Comment;

type GetUserContentOptions = {
    limit?: string,
    after?: string,
}

export function formatUserData(child: any): User {
    return {
        id: child.id,
        type: 'user',
        userName: child.name,
        commentKarma: child.comment_karma,
        postKarma: child.link_karma,
        icon: child.icon_img.split('?')[0],
        mailCount: child.inbox_count,
        friends: child.is_friend,
        isLoggedInUser: child.inbox_count !== undefined,
        after: child.id,
        createdAt: child.created_utc,
        timeSinceCreated: new Time(child.created_utc * 1000).prettyTimeSince() + ' old',
    }
}

export async function getUser(url: string): Promise<User> {
    const redditURL = new RedditURL(`${url}/about`);
    redditURL.jsonify();
    const response = await api(redditURL.toString());
    const user: User = formatUserData(response.data);
    return user;
}

export async function getUserContent(url: string, options: GetUserContentOptions = {}): Promise<UserContent[]> {
    const redditURL = new RedditURL(url);
    redditURL.setQueryParams(options);
    redditURL.jsonify();
    const response = await api(redditURL.toString());
    const overview = response.data.children.map((child: any) => {
        if (child.kind === 't3') {
            return formatPostData(child);
        }
        if (child.kind === 't1') {
            return formatComments([child])[0];
        }
    });
    return overview;
}
