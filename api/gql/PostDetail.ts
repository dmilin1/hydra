import { defineOperation, gql } from "./GqlApi";
import {
  formatAuthorFlair,
  formatPost,
  formatVote,
  getPostInfosByIds,
  isPost,
  parseTime,
} from "./Posts";
import { contentToHtml } from "./RichText";
import { checkSubredditAccess } from "./SubredditAccess";
import { Comment, PostDetail } from "../PostDetail";
import KeyStore from "../../utils/KeyStore";
import RedditURL from "../../utils/RedditURL";
import Time from "../../utils/Time";

/**
 * Post detail pages load like they do in Reddit's app: PostsByIds for the
 * post and PostComments for the comment tree, in parallel. Reddit returns at
 * most 25 comments per request. The rest sit behind "more" entries, which
 * loadMoreComments() loads by cursor.
 */

const PostComments = defineOperation(
  "PostComments",
  "8a25ae56c1d4813102f4eded0c427b99f46f6a63f77630e78767f27ef5186f1f",
);

// commentFragment's switches, shared by every query that returns comments so
// they all have the same shape. Off: data Hydra doesn't show.
const COMMENT_FRAGMENT_VARIABLES = {
  includeAwards: false,
  includeCommentsHtmlField: false,
  includeIsGildable: false,
  includeModerationInfo: false,
  subredditUserPostEditingAllowed: false,
  includeExtendedVideoAsset: true,
  includePlaybackMp4s: true,
  includeMuxedMp4s: true,
  includeVideoPlaybackInComments: false,
  includeCommentViewStats: false,
  includePremiumAvatarTreatment: false,
  includeCommentFollowedForNotificationsStatus: false,
  includeCommentEntityHighlights: false,
  includeRedditHandleInfo: false,
  includeVerificationStatus: false,
};

// The variables Reddit's app sends with PostComments, minus its 8 comment
// truncation (Reddit caps responses at 25 comments either way).
const POST_COMMENTS_VARIABLES = {
  ...COMMENT_FRAGMENT_VARIABLES,
  maxDepth: 10,
  count: 200,
  includeAdEligibility: false,
  isUserMod: false,
  skipPostInfoFragment: true,
  includeConsistencyToken: false,
  callerContext: { referrer: "FEED" },
};

// Hydra's comment sorts (the ?sort= param) to Reddit's CommentSort.
const COMMENT_SORTS: Record<string, string> = {
  best: "CONFIDENCE",
  confidence: "CONFIDENCE",
  new: "NEW",
  top: "TOP",
  controversial: "CONTROVERSIAL",
  old: "OLD",
  qa: "QA",
  "q&a": "QA",
};

/** Reads the post id, comment sort and focused comment from a post URL. */
function parsePostURL(url: string) {
  const redditURL = new RedditURL(url);
  // /comments/<post>/<slug>/<comment>/ or /comments/<post>/comment/<comment>/
  const match = redditURL
    .getRelativePath()
    .match(/\/comments\/([a-z0-9]+)(?:\/[^/?#]*\/([a-z0-9]+))?/i);
  const sort = redditURL.getQueryParam("sort")?.toLowerCase();
  return {
    postId: match?.[1] ?? "",
    commentId: match?.[2],
    context: Number(redditURL.getQueryParam("context") ?? 0) || 0,
    subreddit: redditURL.getSubreddit(),
    sortType: sort ? COMMENT_SORTS[sort] : undefined,
  };
}

/** The comment sort for loading more comments on a post URL. */
export function getCommentSort(url: string): string | undefined {
  return parsePostURL(url).sortType;
}

type CommentParent = {
  name: string;
  depth: number;
  path: number[];
  comments: Comment[];
  loadMore: Comment["loadMore"];
};

type PostInfo = { title: string; link: string; subreddit: string };

const LiveCommentsByIds = defineOperation(
  "LiveCommentsByIds",
  "f6ea957fbe5df4386492b6f153c90e8f0f3d2d3556e908e4e4eb9c5afdb1ffa1",
);

/** Formats one of GraphQL's comments (commentFragment). */
function formatComment(
  node: any,
  parent: CommentParent,
  index: number,
  post: PostInfo,
  collapseAutoModerator: boolean,
): Comment {
  // Deleted comments arrive as DeletedComment, which has no id (their replies
  // are kept; buildCommentTree recovers it from them). Removed comments are
  // Comments with no author or content.
  const deleted =
    node.__typename !== "Comment" || node.isRemoved || !node.content;
  const name: string = node.id ?? `deleted_${parent.name}_${index}`;
  const id = name.replace(/^t1_/, "");
  // Deleted comments have no permalink: build it from the post's, which has
  // no slug when the post is deleted too (the comment id would take its place).
  const postPath = post.link
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/\/comments\/([a-z0-9]+)\/$/i, "/comments/$1/_/");
  const author = deleted ? "[deleted]" : (node.authorInfo?.name ?? "[deleted]");
  const removedText =
    !node.removedByCategory || node.removedByCategory === "DELETED"
      ? "[deleted]"
      : "[removed]";
  const createdAt = parseTime(node.createdAt);
  const depth = parent.depth + 1;
  return {
    id,
    name,
    type: "comment",
    depth,
    path: [...parent.path, index],
    collapsed:
      collapseAutoModerator && depth === 0 && author === "AutoModerator",
    author,
    isOP: node.isOP ?? false,
    isModerator: node.distinguishedAs === "MODERATOR",
    isStickied: node.isStickied ?? false,
    editedAt: node.editedAt ? parseTime(node.editedAt) * 1000 : undefined,
    upvotes: node.score ?? 0,
    scoreHidden: node.isScoreHidden ?? false,
    saved: node.isSaved ?? false,
    userVote: formatVote(node.voteState),
    flair: formatAuthorFlair(node.authorFlair),
    link: node.permalink ?? (node.id ? `${postPath}${id}/` : postPath),
    postTitle: post.title,
    postLink: post.link,
    subreddit: post.subreddit,
    text: deleted ? removedText : (node.content.markdown ?? ""),
    html: deleted
      ? `<div class="md"><p>${removedText}</p></div>`
      : contentToHtml(node.content, id),
    renderCount: 0,
    comments: [],
    loadMore: undefined,
    after: name,
    timeSince: new Time(createdAt * 1000).prettyTimeSince() + " ago",
    shortTimeSince: new Time(createdAt * 1000).shortPrettyTimeSince(),
  };
}

/**
 * Full comments by id (t1_...), for comments listed somewhere with only a
 * preview (user pages, the inbox). Deleted ones are missing from the map:
 * they come back without a permalink to open them by.
 */
export async function getCommentsByIds(
  ids: string[],
): Promise<Map<string, any>> {
  if (!ids.length) return new Map();
  const data = await gql(LiveCommentsByIds, {
    ...COMMENT_FRAGMENT_VARIABLES,
    ids,
  });
  return new Map(
    (data.commentsByIds ?? [])
      .filter((comment: any) => comment?.__typename === "Comment")
      .map((comment: any) => [comment.id, comment]),
  );
}

/**
 * Formats a comment shown on its own rather than in its thread (user pages,
 * the inbox), using its permalink for the post's link and subreddit:
 * /r/<sub>/comments/<post>/<slug>/<comment>/, or /user/<name>/... for posts on
 * a user's profile (subreddit u_<name>).
 */
export function formatStandaloneComment(
  node: any,
  index: number,
  postTitle: string,
): Comment {
  const permalink: string = node.permalink ?? "";
  const location = permalink.match(/^\/(r|user|u)\/([^/]+)\//);
  const post: PostInfo = {
    title: postTitle,
    link: `https://www.reddit.com${permalink.replace(/[^/]+\/?$/, "")}`,
    subreddit: location
      ? location[1] === "r"
        ? location[2]
        : `u_${location[2]}`
      : "",
  };
  const parent = {
    name: "",
    depth: -1,
    path: [],
    comments: [],
    loadMore: undefined,
  };
  return formatComment(node, parent, index, post, false);
}

/**
 * A DeletedComment has no id, but the entries under it (replies and "more"
 * entries) name it as their parentId. Reddit only keeps deleted comments that
 * have replies, so there's nearly always one.
 */
function getDeletedCommentId(trees: any[], i: number): string | undefined {
  const depth = trees[i].depth;
  for (let j = i + 1; j < trees.length && trees[j].depth > depth; j++) {
    if (trees[j].depth === depth + 1 && trees[j].parentId) {
      return trees[j].parentId;
    }
  }
  return undefined;
}

/**
 * Builds PostComments' flat, depth-first list of comments and "more" entries
 * into nested comments under `root`. Entries at the shallowest depth belong to
 * root: depths are relative to a loaded "more", and negative for the parents
 * of a focused comment. New comments are numbered from `childStartIndex`.
 */
function buildCommentTree(
  trees: any[],
  root: CommentParent,
  post: PostInfo,
  childStartIndex = 0,
) {
  const collapseAutoModerator =
    KeyStore.getBoolean("collapseAutoModerator") ?? true;
  const baseDepth = Math.min(...trees.map((tree) => tree.depth));
  // ancestors[d] is the latest comment at relative depth d.
  const ancestors: CommentParent[] = [];
  for (const [i, tree] of trees.entries()) {
    const level = tree.depth - baseDepth;
    const parent = level === 0 ? root : ancestors[level - 1];
    if (!parent) continue;
    if (tree.more) {
      parent.loadMore = {
        count: tree.more.count ?? 0,
        cursor: tree.more.cursor,
      };
      continue;
    }
    if (!tree.node) continue;
    const index =
      parent === root
        ? childStartIndex + root.comments.length
        : parent.comments.length;
    const comment = formatComment(
      tree.node.id
        ? tree.node
        : { ...tree.node, id: getDeletedCommentId(trees, i) },
      parent,
      index,
      post,
      collapseAutoModerator,
    );
    parent.comments.push(comment);
    ancestors[level] = comment;
    ancestors.length = level + 1;
  }
}

async function getCommentForest(variables: Record<string, any>) {
  const data = await gql(PostComments, {
    ...POST_COMMENTS_VARIABLES,
    ...variables,
  });
  return data.postInfoById?.commentForest ?? null;
}

/**
 * The post and its comments, or one
 * comment's thread for comment links (/comments/<post>/<slug>/<comment>/,
 * with ?context=N parents). Returns undefined when the user declines a
 * quarantined or gated subreddit's warning.
 */
export async function getPostsDetail(
  url: string,
): Promise<PostDetail | undefined> {
  const { postId, commentId, context, subreddit, sortType } = parsePostURL(url);
  const name = `t3_${postId}`;
  const commentVariables = {
    id: name,
    ...(sortType ? { sortType } : {}),
    ...(commentId
      ? {
          focusedCommentContext: {
            commentId: `t1_${commentId}`,
            isFocusedThreadOnly: true,
            minDeepCommentParents: context,
          },
          numParents: context,
        }
      : {}),
  };
  const load = async () => {
    const [posts, forest] = await Promise.all([
      getPostInfosByIds([name]),
      getCommentForest(commentVariables),
    ]);
    return [posts[0], forest] as const;
  };

  // Check the subreddit's status alongside the post, like the feeds do.
  let [[rawPost, forest], access] = await Promise.all([
    load(),
    subreddit ? checkSubredditAccess(subreddit) : Promise.resolve(undefined),
  ]);
  // Links without a subreddit (/comments/<id>): check the post's. Posts on
  // user profiles have none to check.
  if (!subreddit && rawPost?.subreddit?.name) {
    access = await checkSubredditAccess(rawPost.subreddit.name);
  }
  if (access === "declined") return undefined;
  // Before opting in, Reddit may withhold the post or its comments.
  if (access === "optedIn") {
    [rawPost, forest] = await load();
  }
  // Reddit returns only the type for a profile post its author deleted.
  if (rawPost?.__typename === "DeletedProfilePost") {
    rawPost = {
      __typename: "DeletedSubredditPost",
      id: name,
      title: "[deleted]",
      permalink: new RedditURL(url)
        .getRelativePath()
        .replace(/(\/comments\/[a-z0-9]+\/).*$/i, "$1"),
    };
  }
  if (!isPost(rawPost)) {
    throw new Error("Post not found");
  }

  const post = await formatPost(rawPost);
  const postDetail: PostDetail = {
    ...post,
    type: "postDetail",
    depth: -1,
    path: [],
    collapsed: false,
    isOP: false,
    editedAt: rawPost.editedAt ? parseTime(rawPost.editedAt) * 1000 : undefined,
    postTitle: post.title,
    postLink: post.link,
    comments: [],
    renderCount: 0,
    loadMore: undefined,
  };
  buildCommentTree(forest?.trees ?? [], postDetail, post);
  return postDetail;
}

/**
 * Loads a "more" entry's comments (Comment.loadMore) under `parent`, numbered
 * after its existing children. Returns them along with the next "more" entry
 * for whatever is still unloaded.
 */
export async function loadMoreComments(
  postDetail: PostDetail,
  parent: PostDetail | Comment,
  cursor: string,
  sortType?: string,
): Promise<{ comments: Comment[]; loadMore: Comment["loadMore"] }> {
  const forest = await getCommentForest({
    id: postDetail.name,
    after: cursor,
    ...(sortType ? { sortType } : {}),
  });
  const container: CommentParent = {
    name: parent.name,
    depth: parent.depth,
    path: parent.path,
    comments: [],
    loadMore: undefined,
  };
  buildCommentTree(
    forest?.trees ?? [],
    container,
    postDetail,
    parent.comments.length,
  );
  return { comments: container.comments, loadMore: container.loadMore };
}

/**
 * Fetches a comment again with its replies (e.g. after editing it, or replying
 * to it), keeping its place in the tree.
 */
export async function reloadComment(comment: Comment): Promise<Comment> {
  const { postId } = parsePostURL(comment.link);
  const forest = await getCommentForest({
    id: `t3_${postId}`,
    focusedCommentContext: {
      commentId: comment.name,
      isFocusedThreadOnly: true,
      minDeepCommentParents: 0,
    },
    numParents: 0,
  });
  const parent: CommentParent = {
    name: "",
    depth: comment.depth - 1,
    path: comment.path.slice(0, -1),
    comments: [],
    loadMore: undefined,
  };
  buildCommentTree(
    forest?.trees ?? [],
    parent,
    {
      title: comment.postTitle,
      link: comment.postLink,
      subreddit: comment.subreddit,
    },
    comment.path[comment.path.length - 1],
  );
  const reloaded = parent.comments.find((c) => c.name === comment.name);
  if (!reloaded) {
    throw new Error("Comment not found");
  }
  return {
    ...reloaded,
    collapsed: comment.collapsed,
    renderCount: comment.renderCount + 1,
  };
}
