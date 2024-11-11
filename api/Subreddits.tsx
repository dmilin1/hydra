import "react-native-url-polyfill/auto";
import { api } from "./RedditApi";
import Time from "../utils/Time";

export type Subreddit = {
  id: string;
  type: "subreddit";
  name: string;
  url: string;
  moderating: boolean;
  subscribed: boolean;
  description?: string;
  iconURL?: string;
  subscribers: number;
  timeSinceCreation: string;
  after: string;
};

export type Subreddits = {
  favorites: Subreddit[];
  moderator: Subreddit[];
  subscriber: Subreddit[];
  trending: Subreddit[];
};

type GetSubredditsOptions = {
  limit?: string;
  after?: string;
};

type GetTrendingOptions = {
  limit?: string;
  after?: string;
};

export function formatSubredditData(child: any): Subreddit {
  return {
    id: child.data.id,
    type: "subreddit",
    name: child.data.display_name,
    url: `https://www.reddit.com${child.data.url}`,
    moderating: child.data.user_is_moderator,
    subscribed: child.data.user_is_subscriber,
    description: child.data.public_description,
    iconURL: child.data.community_icon?.split("?")?.[0] ?? child.data.icon_img,
    subscribers: child.data.subscribers,
    timeSinceCreation:
      new Time(child.data.created_utc * 1000).prettyTimeSince() + " old",
    after: child.data.name,
  };
}

export async function getSubreddits(
  options: GetSubredditsOptions = {},
): Promise<Omit<Subreddits, 'favorites'>> {
  const searchParams = new URLSearchParams(options);
  const subredditsPromise = api(
    `https://www.reddit.com/subreddits/mine.json?limit=100&${searchParams.toString()}`,
    {},
    { depaginate: true },
  );
  const moderatorsPromise = api(
    `https://www.reddit.com/subreddits/mine/moderator.json?limit=100&${searchParams.toString()}`,
    {},
    { depaginate: true },
  );
  const [subredditsData, moderatorsData] = await Promise.all([
    subredditsPromise,
    moderatorsPromise,
  ]);

  const subreddits = {
    moderator: moderatorsData.map((child: any) => formatSubredditData(child)),
    subscriber: subredditsData.map((child: any) => formatSubredditData(child)),
    trending: [],
  };
  return subreddits;
}

export async function getTrending(
  options: GetTrendingOptions = { limit: "10" },
): Promise<Subreddit[]> {
  const searchParams = new URLSearchParams(options);
  const data = await api(
    `https://www.reddit.com/subreddits.json?${searchParams.toString()}`,
  );
  return data.data.children.map((child: any) => formatSubredditData(child));
}

export async function setSubscriptionStatus(
  subreddit: string,
  subscribe: boolean,
): Promise<void> {
  const searchParams = new URLSearchParams({
    sr_name: subreddit,
    action: subscribe ? "sub" : "unsub",
  });
  const res = await api(
    `https://www.reddit.com/api/subscribe.json?${searchParams.toString()}`,
    { method: "POST" },
    { requireAuth: true },
  );
}