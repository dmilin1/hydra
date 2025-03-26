export const DEFAULT_POST_SORT_KEY = "defaultPostSort";
export const DEFAULT_POST_SORT_TOP_KEY = "defaultPostSortTop";

export const REMEMBER_POST_SUBREDDIT_SORT_KEY = "rememberPostSubredditSort";
export const SORT_HOME_PAGE = "sortHomePage"
export const makePostSubredditSortKey = (subreddit: string) =>
  `PostSubredditSort-${subreddit.toLowerCase()}`;
export const makePostSubredditSortTopKey = (subreddit: string) =>
  `PostSubredditSortTop-${subreddit.toLowerCase()}`;

export const DEFAULT_COMMENT_SORT_KEY = "defaultCommentSort";

export const REMEMBER_COMMENT_SUBREDDIT_SORT_KEY =
  "rememberCommentSubredditSort";
export const makeCommentSubredditSortKey = (subreddit: string) =>
  `CommentSubredditSort-${subreddit.toLowerCase()}`;
