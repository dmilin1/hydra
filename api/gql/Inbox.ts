import { assertOk, defineOperation, gql } from "./GqlApi";
import { loadPage } from "./Paging";
import { formatStandaloneComment, getCommentsByIds } from "./PostDetail";
import { getRawPostsByIds, parseTime } from "./Posts";
import { CommentReply } from "../Inbox";

/**
 * Reddit's inbox is now a notification feed (private messages moved to chat).
 * Most of it is Reddit's own suggestions and announcements, so Hydra keeps
 * only replies and username mentions, like the old inbox's comment replies.
 */

const GetInboxNotificationFeedV2 = defineOperation(
  "GetInboxNotificationFeedV2",
  "bfb3b015837f416e9ceb15d8c8082cd6bfc727124e8ac969eb25332c331ee614",
);

const ReadNotificationLoggedIn = defineOperation(
  "ReadNotificationLoggedIn",
  "24b629a06ffa10ec063019055a89c02e3779649a21c46850911dd71498fc548d",
);

const MarkInboxAsRead = defineOperation(
  "MarkInboxAsRead",
  "0f753ac3800283cf281af884e096c7d2bbb90894315e8b01eae65ac337dd93be",
);

// Suggestions make up most of the feed, so fetch big pages.
const PAGE_SIZE = 50;

const REPLY_TYPES = new Set([
  "POST_REPLY",
  "COMMENT_REPLY",
  "USERNAME_MENTION",
]);

/**
 * Notifications marked read in this session, and when all were. Reads can lag
 * behind the write, so these keep a refresh from showing them unread again.
 */
const readNotificationIds = new Set<string>();
let allReadAt = 0;
let stateVersion = 0;

/** Forgets what was marked read, e.g. when the logged in account changes. */
export function resetInboxState() {
  readNotificationIds.clear();
  allReadAt = 0;
  stateVersion++;
}

type ReplyNotification = {
  notificationIds: string[];
  commentId: string;
  /** The post's id without t3_, from the notification's link. */
  postId?: string;
  postTitle?: string;
  read: boolean;
};

/** The post (id without t3_) a notification links to. */
function getPostId(node: any): string | undefined {
  return (
    node?.context?.post?.id?.replace(/^t3_/, "") ??
    (node?.deeplinkUrl ?? "").match(/\/comments\/([a-z0-9]+)\//i)?.[1]
  );
}

/** The comment id (t1_...) a notification is about, if it's a reply. */
function getReplyCommentId(node: any): string | undefined {
  const type: string = node?.context?.messageType ?? "";
  if (!REPLY_TYPES.has(type) && !(node?.comment && type.includes("REPLY"))) {
    return undefined;
  }
  if (node.comment?.id) return node.comment.id;
  // Mentions have no comment, but link to it: .../comments/<post>/<slug>/<id>/
  const match = (node.deeplinkUrl ?? "").match(
    /\/comments\/[^/]+\/[^/]+\/([a-z0-9]+)\/?(?:[?#].*)?$/i,
  );
  return match ? `t1_${match[1]}` : undefined;
}

function isRead(node: any): boolean {
  return (
    !!node.readAt ||
    readNotificationIds.has(node.id) ||
    (!!allReadAt && parseTime(node.sentAt) * 1000 <= allReadAt)
  );
}

/**
 * The replies on one page of the feed, one per comment: a reply that also
 * mentions the user arrives as both a reply and a mention.
 */
function getReplyNotifications(edges: any[]): ReplyNotification[] {
  const byComment = new Map<string, ReplyNotification>();
  for (const node of (edges ?? []).map((edge: any) => edge?.node)) {
    const commentId = node?.id && getReplyCommentId(node);
    if (!commentId) continue;
    const existing = byComment.get(commentId);
    if (existing) {
      existing.notificationIds.push(node.id);
      existing.read = existing.read && isRead(node);
      existing.postTitle ??= node.context?.post?.title;
      existing.postId ??= getPostId(node);
    } else {
      byComment.set(commentId, {
        notificationIds: [node.id],
        commentId,
        postId: getPostId(node),
        postTitle: node.context?.post?.title,
        read: isRead(node),
      });
    }
  }
  return [...byComment.values()];
}

async function formatReplies(
  notifications: ReplyNotification[],
): Promise<CommentReply[]> {
  if (!notifications.length) return [];
  // Mentions don't include their post's title, so fetch those posts too.
  const missingTitles = [
    ...new Set(
      notifications
        .filter((notification) => !notification.postTitle)
        .map((notification) => notification.postId)
        .filter((id): id is string => !!id),
    ),
  ];
  const [comments, posts] = await Promise.all([
    getCommentsByIds(
      notifications.map((notification) => notification.commentId),
    ),
    missingTitles.length
      ? getRawPostsByIds(missingTitles.map((id) => `t3_${id}`))
      : Promise.resolve([]),
  ]);
  const postTitles = new Map<string, string>(
    posts.map((post: any) => [
      post.id.replace(/^t3_/, ""),
      post.postTitle ?? post.title ?? "",
    ]),
  );

  return notifications.flatMap((notification, index) => {
    const raw = comments.get(notification.commentId);
    if (!raw) return [];
    const comment = formatStandaloneComment(raw, index, "");
    return [
      {
        id: comment.id,
        name: comment.name,
        type: "commentReply" as const,
        notificationIds: notification.notificationIds,
        author: comment.author,
        upvotes: comment.upvotes,
        userVote: comment.userVote,
        new: !notification.read,
        postTitle:
          notification.postTitle ??
          postTitles.get(notification.postId ?? "") ??
          "",
        contextLink: `${comment.link}?context=3`,
        subreddit: comment.subreddit,
        html: comment.html,
        after: comment.name,
        timeSince: comment.timeSince,
      },
    ];
  });
}

/** The inbox's replies and mentions, a page at a time. */
export async function getInboxItems(
  options: { after?: string } = {},
): Promise<CommentReply[]> {
  return await loadPage<CommentReply>(
    "inbox",
    options.after,
    async (cursor) => {
      const data = await gql(GetInboxNotificationFeedV2, {
        pageSize: PAGE_SIZE,
        includeAnnouncement: false,
        ...(cursor ? { after: cursor } : {}),
      });
      const elements = data.notificationInboxV2?.elements;
      return {
        items: await formatReplies(getReplyNotifications(elements?.edges)),
        ...elements?.pageInfo,
      };
    },
  );
}

/**
 * How many replies on the first page of the inbox are unread, for the badge.
 * One request: the replies themselves aren't needed.
 */
export async function getUnreadInboxCount(): Promise<number> {
  const data = await gql(GetInboxNotificationFeedV2, {
    pageSize: PAGE_SIZE,
    includeAnnouncement: false,
  });
  return getReplyNotifications(
    data.notificationInboxV2?.elements?.edges,
  ).filter((notification) => !notification.read).length;
}

/**
 * Marks a reply read. Reddit has no way to mark notifications unread.
 */
export async function markInboxItemRead(item: CommentReply): Promise<void> {
  await Promise.all(
    item.notificationIds.map(async (notificationId) => {
      const data = await gql(ReadNotificationLoggedIn, {
        input: { notificationId },
      });
      assertOk(data.readNotificationLoggedIn, "Failed to mark as read");
      readNotificationIds.add(notificationId);
    }),
  );
}

/** Marks every notification read, Reddit's suggestions included. */
export async function markAllInboxItemsRead(): Promise<void> {
  const version = stateVersion;
  const data = await gql(MarkInboxAsRead, {
    input: { types: ["NOTIFICATIONS"] },
  });
  assertOk(data.markInboxAsRead, "Failed to mark all read");
  if (version === stateVersion) allReadAt = Date.now();
}
