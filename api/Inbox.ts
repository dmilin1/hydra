import { VoteOption } from "./Posts";

export type CommentReply = {
  id: string;
  name: string;
  type: "commentReply";
  /** The inbox notifications for this reply (a reply can also be a mention). */
  notificationIds: string[];
  author: string;
  upvotes: number;
  userVote: VoteOption;
  new: boolean;
  postTitle: string;
  contextLink: string;
  subreddit: string;
  html: string;
  after: string;
  timeSince: string;
};
