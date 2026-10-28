import { assertOk, defineOperation, gql } from "./GqlApi";
import { loadPage } from "./Paging";
import { formatStandaloneComment, getCommentsByIds } from "./PostDetail";
import {
  formatPosts,
  getPostsByIds,
  parseTime,
  POST_FRAGMENT_VARIABLES,
  sduiPostIds,
} from "./Posts";
import { getCurrentUserId } from "./WebToken";
import { Comment } from "../PostDetail";
import { Post } from "../Posts";
import {
  BannedUserError,
  User,
  UserContent,
  UserDoesNotExistError,
} from "../User";
import RedditURL from "../../utils/RedditURL";
import Time from "../../utils/Time";
import URL from "../../utils/URL";

/**
 * User pages load like Reddit's app's profile tabs: a list query for the ids
 * (and comments' post titles), then PostsByIds or LiveCommentsByIds for the
 * full posts or comments. Reddit has no mixed posts-and-comments feed, so a
 * user's base page shows one or the other.
 */

const UpdateRedditorBlockState = defineOperation(
  "UpdateRedditorBlockState",
  "86c22ca218ee5ea71e5b6304f6546482d568afcbd4cf194b0631b787ab87075c",
);

const UpdateProfileFollowState = defineOperation(
  "UpdateProfileFollowState",
  "5b5bcb2267013236e67b37c4a7341a157467777c2de5599bfed135ed8ea30eba",
);

const GetAccount = defineOperation(
  "GetAccount",
  "b5ad6715b375f0a4c5347979f1237364025b78028b90a8a618e9b1e8036b26ef",
);

const UserProfile = defineOperation(
  "UserProfile",
  "a05c628c5469c6b107c85988a8b1d0b79a2e7b6150ebd3a449c67e226e975ddc",
);

const SubmittedPostsFeedSdui = defineOperation(
  "SubmittedPostsFeedSdui",
  "d973adb1955e30c12e200bd2dbe843172276aebbae0ff1a8dda76f0ad19a0605",
);

const SubmittedComments = defineOperation(
  "SubmittedComments",
  "e1b37f521fb40af2120946b70e7fbf6a3d924db2abaf28ff2164d4cfacca28db",
);

const SavedPostsFeedSdui = defineOperation(
  "SavedPostsFeedSdui",
  "929e762251408c04a8734d2ba51128c733dbabad9b8bbb313f919e2fd3ae54ce",
);

const SavedComments = defineOperation(
  "SavedComments",
  "f59debcda8c989bcd661947fb7cb311559d1d9df8329ef000dc31817a399de81",
);

const UpvotedPosts = defineOperation(
  "UpvotedPosts",
  "4997de5649516763ab57f3f70eeba4c7638978c8613fc81c3212b1b5dbd0497e",
);

const DownvotedPosts = defineOperation(
  "DownvotedPosts",
  "8e0d27e0f698b8718928bc8ebb0c5b5690b51bceb862db7ce4c7da6c4deef0f5",
);

const HiddenPosts = defineOperation(
  "HiddenPosts",
  "7548e75ad724b6888e7901b3a757d5111008c02624af20b0141b40fdca6276d2",
);

const PAGE_SIZE = 25;

export async function blockUser(user: User): Promise<void> {
  const data = await gql(UpdateRedditorBlockState, {
    redditorId: `t2_${user.id}`,
    blockState: "BLOCKED",
  });
  assertOk(data.updateRedditorBlockState, "Failed to block user");
}

/** Follows or unfollows a user, like Reddit's app's profile Follow button. */
export async function setFollowStatus(
  user: User,
  follow: boolean,
): Promise<void> {
  const data = await gql(UpdateProfileFollowState, {
    input: {
      accountId: `t2_${user.id}`,
      state: follow ? "FOLLOWED" : "NONE",
    },
  });
  assertOk(
    data.updateProfileFollowState,
    `Failed to ${follow ? "follow" : "unfollow"} u/${user.userName}`,
  );
}

/**
 * UserProfile results by lowercased username, kept briefly so a user page's
 * header and first page of content share one request.
 */
const profileCache = new Map<string, Promise<any>>();

// Lowercased names of users whose profile was available this session, so
// sort changes and the Posts/Comments toggle don't check it again.
const availableUsers = new Set<string>();

/** Forgets cached profiles, e.g. when the logged in account changes. */
export function resetUserState() {
  profileCache.clear();
  availableUsers.clear();
}

function getProfile(userName: string): Promise<any> {
  const key = userName.toLowerCase();
  let profile = profileCache.get(key);
  if (!profile) {
    profile = gql(UserProfile, {
      name: userName,
      includePremiumAvatarTreatment: false,
    }).then((data) => data.redditorInfoByName ?? null);
    profileCache.set(key, profile);
    const forget = () => setTimeout(() => profileCache.delete(key), 10_000);
    // Failures aren't kept, so a retry asks again.
    profile.then(forget, () => profileCache.delete(key));
  }
  return profile;
}

/** Throws UserDoesNotExistError or BannedUserError for unavailable users. */
function checkProfile(profile: any) {
  if (!profile || profile.__typename === "DeletedRedditor") {
    throw new UserDoesNotExistError();
  }
  if (profile.__typename !== "Redditor") {
    throw new BannedUserError();
  }
}

/** Reads the username, section and saved type from a user page URL. */
export function parseUserURL(url: string) {
  const urlObject = new URL(url);
  // https://www.reddit.com/user/<name>/<section>
  const [, , , , userName = "", section = ""] = urlObject
    .getBasePath()
    .split("/");
  return {
    userName,
    // /overview is old Reddit's name for the base page.
    section: section.toLowerCase() === "overview" ? "" : section.toLowerCase(),
    savedType: urlObject.getQueryParam("type"),
  };
}

/**
 * Formats a Redditor from UserProfile or GetAccount. Account creation time
 * is passed separately since GetAccount has it on the identity.
 */
function formatUser(
  redditor: any,
  createdAtTime: string | undefined,
  isLoggedInUser: boolean,
): User {
  const createdAt = createdAtTime ? parseTime(createdAtTime) : 0;
  return {
    id: (redditor.id ?? "").replace(/^t2_/, ""),
    type: "user",
    userName: redditor.name ?? "",
    commentKarma: redditor.karma?.fromComments ?? 0,
    postKarma: redditor.karma?.fromPosts ?? 0,
    // Following a user is subscribing to their profile.
    following: redditor.profile?.isSubscribed ?? false,
    isLoggedInUser,
    after: redditor.id ?? "",
    createdAt,
    timeSinceCreated: new Time(createdAt * 1000).prettyTimeSince() + " old",
  };
}

/** The profile for a user page URL (/user/<name>/...). */
export async function getUser(url: string): Promise<User> {
  const { userName } = parseUserURL(url);
  const [profile, currentUserId] = await Promise.all([
    getProfile(userName),
    getCurrentUserId(),
  ]);
  checkProfile(profile);
  return formatUser(
    profile,
    profile.profile?.createdAt,
    !!profile.id && profile.id === currentUserId,
  );
}

/**
 * The logged in user, like Reddit's app's GetAccount. Throws
 * NotLoggedInError (from the token refresh) when the session cookie is
 * missing, and an error when Reddit rejects it.
 */
export async function getCurrentUser(): Promise<User> {
  const data = await gql(GetAccount, {
    includePremiumAvatarTreatment: false,
    includeBrandToolsStatus: false,
    includePostFlairTemplates: false,
    includeRedditHandleInfo: false,
    includeVerificationStatus: false,
    includeHumanVerificationActionNeeded: false,
  });
  const identity = data.identity;
  if (!identity?.redditor?.name) {
    throw new Error("Reddit did not return the logged in account");
  }
  return formatUser(
    identity.redditor,
    identity.createdAt ?? identity.redditor.profileInfo?.createdAt,
    true,
  );
}

/** The sort variables for a user page URL (?sort=, ?t=). */
function getSortVariables(url: string) {
  const [sort, time] = new RedditURL(url).getSort();
  return {
    sort: (sort ?? "new").toUpperCase(),
    time: time ? time.toUpperCase() : undefined,
  };
}

/**
 * Fetches full comments for a comment list's edges, which only carry a
 * plain-text preview. Keeps the list's order and post titles.
 */
async function commentsFromEdges(edges: any[]): Promise<Comment[]> {
  const listed = (edges ?? [])
    .map((edge: any) => edge?.node)
    .filter((node: any) => node?.__typename === "Comment" && node.id);
  const comments = await getCommentsByIds(listed.map((node: any) => node.id));
  return listed.flatMap((node: any, index: number) => {
    const comment = comments.get(node.id);
    return comment
      ? [formatStandaloneComment(comment, index, node.postInfo?.title ?? "")]
      : [];
  });
}

type GetUserContentOptions = {
  after?: string;
  /** What a user's base page (no section) shows. Defaults to posts. */
  type?: "posts" | "comments";
};

async function getSubmittedPosts(
  url: string,
  userName: string,
  after?: string,
) {
  const { sort, time } = getSortVariables(url);
  return await loadPage<Post>(`posts:${url}`, after, async (cursor) => {
    const data = await gql(SubmittedPostsFeedSdui, {
      username: userName,
      sort,
      ...(time ? { time } : {}),
      ...(cursor ? { after: cursor } : {}),
    });
    const elements = data.profileFeed?.elements;
    return {
      items: await getPostsByIds(sduiPostIds(elements?.edges)),
      ...elements?.pageInfo,
    };
  });
}

async function getSubmittedComments(
  url: string,
  userName: string,
  after?: string,
) {
  const { sort, time } = getSortVariables(url);
  return await loadPage<Comment>(`comments:${url}`, after, async (cursor) => {
    const data = await gql(SubmittedComments, {
      name: userName,
      sort,
      ...(time ? { range: time } : {}),
      pageSize: PAGE_SIZE,
      ...(cursor ? { after: cursor } : {}),
    });
    if (!data.redditorInfoByName) {
      throw new UserDoesNotExistError();
    }
    const list = data.redditorInfoByName.comments;
    return {
      items: await commentsFromEdges(list?.edges),
      ...list?.pageInfo,
    };
  });
}

const IDENTITY_POST_LISTS = {
  upvoted: { operation: UpvotedPosts, field: "upvotedPosts" },
  downvoted: { operation: DownvotedPosts, field: "downvotedPosts" },
  hidden: { operation: HiddenPosts, field: "hiddenPosts" },
} as const;

/**
 * The logged in user's upvoted, downvoted or hidden posts. These lists return
 * full posts, so unlike the others they need no PostsByIds request.
 */
async function getIdentityPosts(
  section: keyof typeof IDENTITY_POST_LISTS,
  after?: string,
) {
  const { operation, field } = IDENTITY_POST_LISTS[section];
  return await loadPage<Post>(section, after, async (cursor) => {
    const data = await gql(operation, {
      ...POST_FRAGMENT_VARIABLES,
      pageSize: PAGE_SIZE,
      ...(cursor ? { after: cursor } : {}),
    });
    const list = data.identity?.[field];
    return {
      items: await formatPosts(
        (list?.edges ?? []).map((edge: any) => edge?.node),
      ),
      ...list?.pageInfo,
    };
  });
}

async function getSavedPosts(after?: string) {
  return await loadPage<Post>("savedPosts", after, async (cursor) => {
    const data = await gql(SavedPostsFeedSdui, {
      ...(cursor ? { after: cursor } : {}),
    });
    const elements = data.savedV3?.elements;
    return {
      items: await getPostsByIds(sduiPostIds(elements?.edges)),
      ...elements?.pageInfo,
    };
  });
}

async function getSavedComments(after?: string) {
  return await loadPage<Comment>("savedComments", after, async (cursor) => {
    const data = await gql(SavedComments, {
      ...(cursor ? { after: cursor } : {}),
    });
    const list = data.identity?.savedComments;
    return {
      items: await commentsFromEdges(list?.edges),
      ...list?.pageInfo,
    };
  });
}

/**
 * A user page's posts or comments. Handles a user's base
 * page (posts or comments, per options.type), /submitted, /comments, and the
 * logged in user's /upvoted, /downvoted, /hidden and /saved (?type=comments
 * for saved comments, posts otherwise).
 */
export async function getUserContent(
  url: string,
  options: GetUserContentOptions = {},
): Promise<UserContent[]> {
  const { userName, section, savedType } = parseUserURL(url);
  const { after } = options;

  if (section === "" || section === "submitted" || section === "comments") {
    const showComments =
      section === "comments" || (section === "" && options.type === "comments");
    const load = showComments ? getSubmittedComments : getSubmittedPosts;
    if (after || availableUsers.has(userName.toLowerCase())) {
      return await load(url, userName, after);
    }
    // Check the user alongside the first page, so unavailable users show
    // their error instead of an empty list.
    const [content, profile] = await Promise.all([
      load(url, userName),
      getProfile(userName),
    ]);
    checkProfile(profile);
    availableUsers.add(userName.toLowerCase());
    return content;
  }

  if (
    section === "upvoted" ||
    section === "downvoted" ||
    section === "hidden" ||
    section === "saved"
  ) {
    // These lists always belong to the logged in user. Checked on the first
    // page only.
    if (!after) {
      const [profile, currentUserId] = await Promise.all([
        getProfile(userName),
        getCurrentUserId(),
      ]);
      checkProfile(profile);
      if (profile.id !== currentUserId) return [];
    }
    if (section === "saved") {
      return savedType === "comments"
        ? await getSavedComments(after)
        : await getSavedPosts(after);
    }
    return await getIdentityPosts(section, after);
  }

  return [];
}
