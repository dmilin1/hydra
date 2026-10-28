import { ImageSource } from "expo-image";

import { Flair } from "./Flair";
import { PostFlair } from "./PostFlair";
import { OpenGraphData } from "../utils/URL";

export type Poll = {
  voteCount: number;
  options: {
    id: string;
    text: string;
  }[];
};

export type Post = {
  id: string;
  name: string;
  type: "post";
  crossPost?: Post;
  crossCommentLink?: string;
  title: string;
  author: string;
  upvotes: number;
  saved: boolean;
  userVote: VoteOption;
  flair: Flair | null;
  postFlair: PostFlair | null;
  subreddit: string;
  subredditIcon: string;
  isModerator: boolean;
  isStickied: boolean;
  isNSFW: boolean;
  isSpoiler: boolean;
  interactionDisabledStatus: "locked" | "archived" | null;
  text: string;
  html: string;
  commentCount: number;
  link: string;
  images: (string | ImageSource[])[];
  imageThumbnail: ImageSource | null;
  mediaAspectRatio: number;
  videos: {
    source: string;
    hasAudio: boolean;
    sourceLoadError?: string;
  }[];
  poll: Poll | undefined;
  externalLink: string | undefined;
  openGraphData: OpenGraphData | undefined;
  timeSince: string;
  after: string;
};

export enum VoteOption {
  UpVote = 1,
  NoVote = 0,
  DownVote = -1,
}

export class BannedSubredditError extends Error {
  name: "BannedSubredditError";
  constructor() {
    super("BannedSubredditError");
    this.name = "BannedSubredditError";
  }
}

export class PrivateSubredditError extends Error {
  name: "PrivateSubredditError";
  constructor() {
    super("PrivateSubredditError");
    this.name = "PrivateSubredditError";
  }
}

export class SubredditDoesNotExistError extends Error {
  name: "SubredditDoesNotExistError";
  constructor() {
    super("SubredditDoesNotExistError");
    this.name = "SubredditDoesNotExistError";
  }
}
