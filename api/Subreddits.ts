export type Subreddit = {
  id: string;
  type: "subreddit";
  name: string;
  url: string;
  description?: string;
  iconURL?: string;
  subscribers: number;
  weeklyVisitors?: number;
  after: string;
};

/**
 * A subreddit in the user's subscribed or moderated list, or in a
 * multireddit. Reddit returns those lists without descriptions or subscriber
 * counts.
 */
export type SubredditListItem = Pick<
  Subreddit,
  "id" | "type" | "name" | "url" | "iconURL"
>;

export type Subreddits = {
  favorites: SubredditListItem[];
  moderator: SubredditListItem[];
  subscriber: SubredditListItem[];
};
