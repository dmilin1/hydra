import "react-native-url-polyfill/auto";
import { decode } from "html-entities";

import { Flair, formatFlair } from "./Flair";
import { Post, formatPostData, VoteOption } from "./Posts";
import { api } from "./RedditApi";
import { UserContent } from "./User";
import RedditURL from "../utils/RedditURL";
import Time from "../utils/Time";

export type Comment = {
  id: string;
  name: string;
  type: "comment";
  depth: number;
  path: number[];
  author: string;
  isOP: boolean;
  isModerator: boolean;
  isStickied: boolean;
  upvotes: number;
  scoreHidden: boolean;
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
  loadMore:
    | undefined
    | {
        depth: number;
        childIds: string[];
      };
  after: string;
  createdAt: number;
  timeSince: string;
  shortTimeSince: string;
};

export type PostDetail = Omit<Comment, "type"> &
  Omit<Post, "type"> & {
    type: "postDetail";
  };

export function formatComments(
  comments: any,
  commentPath: number[] = [],
  childStartIndex = 0,
  renderCount = 0,
): Comment[] {
  const formattedComments: Comment[] = [];
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.kind === "more") continue;
    const childCommentPath = [...commentPath, i + childStartIndex];
    const loadMoreChild = comment.data.replies?.data?.children.find(
      (child: any) => child.kind === "more",
    );
    let userVote = VoteOption.NoVote;
    if (comment.data.likes === true) {
      userVote = VoteOption.UpVote;
    } else if (comment.data.likes === false) {
      userVote = VoteOption.DownVote;
    }
    formattedComments.push({
      id: comment.data.id,
      name: comment.data.name,
      type: "comment",
      depth: commentPath.length,
      path: childCommentPath,
      author: comment.data.author,
      isOP: comment.data.is_submitter,
      isModerator: comment.data.distinguished === "moderator",
      isStickied: comment.data.stickied,
      upvotes: comment.data.ups,
      scoreHidden: comment.data.score_hidden,
      userVote,
      flair: formatFlair(comment.data),
      link: comment.data.permalink,
      postTitle: comment.data.link_title,
      postLink: comment.data.link_permalink,
      subreddit: comment.data.subreddit,
      text: decode(comment.data.body),
      html: decode(comment.data.body_html),
      comments: comment.data.replies
        ? formatComments(comment.data.replies.data.children, childCommentPath)
        : [],
      renderCount,
      loadMore: loadMoreChild
        ? {
            depth: loadMoreChild.data.depth,
            childIds: loadMoreChild.data.children,
          }
        : undefined,
      after: comment.data.name,
      createdAt: comment.data.created,
      timeSince:
        new Time(comment.data.created * 1000).prettyTimeSince() + " ago",
      shortTimeSince: new Time(
        comment.data.created * 1000,
      ).shortPrettyTimeSince(),
    });
  }
  return formattedComments;
}

type GetPostDetailOptions = {
  limit?: number;
};

export async function getPostsDetail(
  url: string,
  options: GetPostDetailOptions = {},
): Promise<PostDetail> {
  const redditURL = new RedditURL(url);
  redditURL.changeQueryParam("sr_detail", "true");
  redditURL.changeQueryParam("limit", String(options?.limit ?? 75));
  redditURL.jsonify();
  const response = await api(redditURL.toString());
  const postData = response[0].data.children[0];
  const post = await formatPostData(postData);
  const comments = response[1].data.children;
  const formattedComments = formatComments(comments);
  const loadMoreChild = comments.find((child: any) => child.kind === "more");
  return {
    ...post,
    type: "postDetail",
    depth: -1,
    path: [],
    isOP: postData.data.is_submitter,
    postTitle: postData.data.link_title,
    postLink: postData.data.link_permalink,
    comments: formattedComments,
    renderCount: 0,
    loadMore: loadMoreChild
      ? {
          depth: loadMoreChild.data.depth,
          childIds: loadMoreChild.data.children,
        }
      : undefined,
  };
}

export async function loadMoreComments(
  subreddit: string,
  postId: string,
  commentIds: string[],
  commentPath: number[],
  childStartIndex: number,
): Promise<Comment[]> {
  const responses = await Promise.all(
    commentIds.map((commentId) =>
      api(
        `https://www.reddit.com/r/${subreddit}/comments/${postId}/comment/${commentId}/.json`,
      ),
    ),
  );
  const formattedComments = formatComments(
    responses
      .map((response) => response[1]?.data?.children?.[0])
      .filter((comment) => comment !== undefined),
    commentPath,
    childStartIndex,
  );
  return formattedComments;
}

export async function vote(
  item: UserContent,
  voteOption: VoteOption,
): Promise<VoteOption> {
  const dir = item.userVote === voteOption ? VoteOption.NoVote : voteOption;
  await api(
    "https://www.reddit.com/api/vote",
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        id: item.name,
        dir,
      },
    },
  );
  return dir;
}

export async function reloadComment(
  comment: Comment | PostDetail,
): Promise<Comment> {
  const response = await api(new RedditURL(comment.link).jsonify().toString());
  const commentData = response[1].data.children[0];
  const formattedComment = formatComments(
    [commentData],
    comment.path.slice(0, -1),
    comment.path.slice(-1)[0],
    comment.renderCount + 1,
  )[0];
  return formattedComment;
}

export async function submitPost(
  subreddit: string,
  kind: "self" | "link" | "image",
  title: string,
  content: string,
): Promise<{ url?: string; success: boolean }> {
  const response = await api(
    "https://www.reddit.com/api/submit?api_type=json",
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        sr: subreddit,
        kind,
        title,
        [kind === "self" ? "text" : "url"]: content,
        extension: "json",
      },
    },
  );
  const errors = response?.json?.errors;
  const data = response?.json?.data;
  return {
    url: data?.url,
    success: Array.isArray(errors) && errors.length === 0,
  };
}

export async function submitComment(
  userContent: Comment | PostDetail,
  text: string,
): Promise<boolean> {
  const response = await api(
    "https://www.reddit.com/api/comment",
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        thing_id: userContent.name,
        text,
      },
    },
  );
  return response?.success ?? false;
}

export async function editUserContent(
  userContent: Comment | PostDetail,
  text: string,
): Promise<boolean> {
  const response = await api(
    "https://www.reddit.com/api/editusertext",
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        thing_id: userContent.name,
        text,
      },
    },
  );
  return response?.success ?? false;
}

export async function deleteUserContent(
  userContent: Comment | PostDetail,
): Promise<void> {
  await api(
    "https://www.reddit.com/api/del",
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        id: userContent.name,
      },
    },
  );
}

export async function savePost(
  post: Post | PostDetail,
  saved: boolean,
): Promise<void> {
  await api(
    `https://www.reddit.com/api/${saved ? "save" : "unsave"}`,
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        id: post.name,
      },
    },
  );
}
