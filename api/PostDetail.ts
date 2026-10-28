import { Flair } from "./Flair";
import { Post, VoteOption } from "./Posts";

export type Comment = {
  id: string;
  name: string;
  type: "comment";
  depth: number;
  path: number[];
  collapsed: boolean;
  author: string;
  isOP: boolean;
  isModerator: boolean;
  isStickied: boolean;
  editedAt: number | undefined;
  upvotes: number;
  scoreHidden: boolean;
  saved: boolean;
  userVote: VoteOption;
  flair: Flair | null;
  link: string;
  postTitle: string;
  postLink: string;
  subreddit: string;
  text: string;
  html: string;
  renderCount: number;
  comments: Comment[];
  /**
   * Replies (or top-level comments, on a PostDetail) that weren't loaded yet.
   * Load them with loadMoreComments() in api/gql/PostDetail.
   */
  loadMore:
    | undefined
    | {
        count: number;
        cursor: string;
      };
  after: string;
  timeSince: string;
  shortTimeSince: string;
};

// The post's own row doesn't show Comment's score or short time.
export type PostDetail = Omit<
  Comment,
  "type" | "scoreHidden" | "shortTimeSince"
> &
  Omit<Post, "type"> & {
    type: "postDetail";
  };

export type LoadMoreCommentsFunc = (commentPath: number[]) => Promise<void>;
