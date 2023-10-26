import 'react-native-url-polyfill/auto'
import { api } from "./RedditApi";
import Time from '../utils/Time';

export type Subreddit = {
    id: string,
    name: string,
    url: string,
    moderating: boolean,
}

export type Subreddits = {
    moderator: Subreddit[],
    subscriber: Subreddit[],
}

type GetSubredditsOptions = {
    limit?: number,
    after?: string,
}

export async function getSubreddits(options: GetSubredditsOptions = {}): Promise<Subreddits> {
    const searchParams = new URLSearchParams();
    const subredditsPromise = api(`https://www.reddit.com/subreddits/mine.json?limit=100${searchParams.toString()}`, {}, { depaginate: true});
    const moderatorsPromise = api(`https://www.reddit.com/subreddits/mine/moderator.json?limit=100${searchParams.toString()}`, {}, { depaginate: true});
    const [subredditsData, moderatorsData] = await Promise.all([subredditsPromise, moderatorsPromise]);
    const remapper = (child: any, isModerator: boolean) => ({
        id: child.data.id,
        name: child.data.display_name,
        url: `https://www.reddit.com${child.data.url}`,
        moderating: isModerator,
    });
    const subreddits = {
        moderator: moderatorsData.map((child: any) => remapper(child, true)),
        subscriber: subredditsData.map((child: any) => remapper(child, false)),
    };
    return subreddits;
}