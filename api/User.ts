import { CommentReply } from "./Inbox";
import { Comment, PostDetail } from "./PostDetail";
import { Post } from "./Posts";

export type User = {
  id: string;
  type: "user";
  userName: string;
  commentKarma: number;
  postKarma: number;
  following: boolean;
  isLoggedInUser: boolean;
  after: string;
  createdAt: number;
  timeSinceCreated: string;
};

export type UserContent = Post | Comment | PostDetail | CommentReply;

export class UserDoesNotExistError extends Error {
  name: "UserDoesNotExistError";
  constructor() {
    super("UserDoesNotExistError");
    this.name = "UserDoesNotExistError";
  }
}

export class BannedUserError extends Error {
  name: "BannedUserError";
  constructor() {
    super("BannedUserError");
    this.name = "BannedUserError";
  }
}
