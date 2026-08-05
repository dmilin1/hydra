import type { Comment, PostDetail } from "../api/PostDetail";

/**
 * The comment tree is deliberately mutated in place. Comment objects keep a
 * stable identity for the lifetime of a post, so the JSX cached inside
 * CommentComponent's useMemo (and the stale closures held within it) always
 * reads fresh data. Re-renders are triggered separately: markPathDirty bumps
 * renderCount on every node from the root down to the changed comment, which
 * CommentComponent's useMemo watches. Off-path comments keep their old
 * renderCount and bail out, so an update costs O(depth), not O(comments).
 */

export function getCommentFromPath(
  root: PostDetail | Comment,
  path: number[],
): PostDetail | Comment | undefined {
  return path.reduce<PostDetail | Comment | undefined>(
    (node, index) => node?.comments[index],
    root,
  );
}

export function markPathDirty(root: PostDetail, path: number[]) {
  let node: PostDetail | Comment = root;
  node.renderCount++;
  for (const index of path) {
    const child: Comment | undefined = node.comments[index];
    if (!child) return;
    child.renderCount++;
    node = child;
  }
}

export function applyCommentChange(
  root: PostDetail,
  newComment: Comment | PostDetail,
) {
  const target = getCommentFromPath(root, newComment.path);
  if (!target) return;
  Object.assign(target, newComment);
  markPathDirty(root, newComment.path);
}

export function removeComment(root: PostDetail, comment: Comment) {
  const parent = getCommentFromPath(root, comment.path.slice(0, -1));
  if (!parent) return;
  const index = parent.comments.findIndex((c) => c.id === comment.id);
  if (index === -1) return;
  parent.comments.splice(index, 1);
  for (let i = index; i < parent.comments.length; i++) {
    reindexSubtree(parent.comments[i], parent.path.length, i);
  }
}

/**
 * Removal shifts the later siblings left, but every node stores its full path
 * from the root, so the stale index has to be corrected in each shifted
 * sibling and all of its descendants.
 */
function reindexSubtree(comment: Comment, pathLevel: number, index: number) {
  comment.path[pathLevel] = index;
  for (const child of comment.comments) {
    reindexSubtree(child, pathLevel, index);
  }
}

export function mergeMoreComments(
  parent: PostDetail | Comment,
  newComments: Comment[],
  fetchedIds: string[],
) {
  const existingIds = new Set(parent.comments.map((c) => c.id));
  parent.comments.push(
    ...newComments.filter((comment) => !existingIds.has(comment.id)),
  );
  if (parent.loadMore) {
    parent.loadMore.childIds = parent.loadMore.childIds.filter(
      (id) => !fetchedIds.includes(id),
    );
  }
}
