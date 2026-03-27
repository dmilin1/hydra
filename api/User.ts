import "react-native-url-polyfill/auto";
import { CommentReply } from "./Messages";
import { Comment, PostDetail, formatComments } from "./PostDetail";
import { Post, formatPostData } from "./Posts";
import { api } from "./RedditApi";
import RedditURL from "../utils/RedditURL";
import Time from "../utils/Time";

export type User = {
  id: string;
  type: "user";
  userName: string;
  commentKarma: number;
  postKarma: number;
  icon: string;
  mailCount?: number;
  friends: boolean;
  isLoggedInUser: boolean;
  after: string;
  modhash?: string;
  createdAt: number;
  timeSinceCreated: string;
};

export type UserContent = Post | Comment | PostDetail | CommentReply;

type GetUserContentOptions = {
  limit?: string;
  after?: string;
};

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

export function formatUserData(child: any): User {
  return {
    id: child.id,
    type: "user",
    userName: child.name,
    commentKarma: child.comment_karma,
    postKarma: child.link_karma,
    icon: child.icon_img.split("?")[0],
    mailCount: child.inbox_count,
    friends: child.is_friend,
    isLoggedInUser: child.inbox_count !== undefined,
    after: child.id,
    modhash: child.modhash,
    createdAt: child.created_utc,
    timeSinceCreated:
      new Time(child.created_utc * 1000).prettyTimeSince() + " old",
  };
}

function handleBadUserResponse(response: any) {
  if (response.error === 403 || response.data?.is_suspended) {
    throw new BannedUserError();
  }
  if (response.error === 404) {
    throw new UserDoesNotExistError();
  }
}

export async function getUser(url: string): Promise<User> {
  const redditURL = new RedditURL(`${url}/about`);
  redditURL.jsonify();
  const response = await api(redditURL.toString());
  handleBadUserResponse(response);
  return formatUserData(response.data);
}

export async function getUserContent(
  url: string,
  options: GetUserContentOptions = {},
): Promise<UserContent[]> {
  const redditURL = new RedditURL(url);
  redditURL.setQueryParams(options);
  redditURL.changeQueryParam("sr_detail", "true");
  redditURL.jsonify();
  const response = await api(redditURL.toString());
  handleBadUserResponse(response);
  const overview = await Promise.all(
    response.data.children.map(async (child: any) => {
      if (child.kind === "t3") {
        return await formatPostData(child);
      }
      if (child.kind === "t1") {
        return formatComments([child])[0];
      }
    }),
  );
  return overview;
}

export async function blockUser(user: User): Promise<void> {
  const redditURL = new RedditURL(`https://www.reddit.com/api/block_user`);
  redditURL.setQueryParams({
    account_id: `t2_${user.id}`,
  });
  redditURL.jsonify();
  await api(
    redditURL.toString(),
    {
      method: "POST",
    },
    {
      requireAuth: true,
    },
  );
}
