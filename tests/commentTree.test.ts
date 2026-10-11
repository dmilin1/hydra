import { describe, expect, test } from "bun:test";

import {
  applyCommentChange,
  getCommentFromPath,
  markPathDirty,
  mergeMoreComments,
  removeComment,
} from "../utils/commentTree";
import type { Comment, PostDetail } from "../api/PostDetail";

const makeComment = (
  id: string,
  path: number[],
  comments: Comment[] = [],
): Comment =>
  ({
    id,
    path,
    depth: path.length - 1,
    renderCount: 0,
    comments,
    loadMore: undefined,
  }) as unknown as Comment;

// root
// ├── a
// │   ├── b
// │   │   └── c
// │   └── d
// └── e
const makeTree = () => {
  const c = makeComment("c", [0, 0, 0]);
  const b = makeComment("b", [0, 0], [c]);
  const d = makeComment("d", [0, 1]);
  const a = makeComment("a", [0], [b, d]);
  const e = makeComment("e", [1]);
  const root = {
    id: "root",
    path: [],
    depth: -1,
    renderCount: 0,
    comments: [a, e],
    loadMore: undefined,
  } as unknown as PostDetail;
  return { root, a, b, c, d, e };
};

describe("getCommentFromPath", () => {
  test("resolves nested comments and the root itself", () => {
    const { root, c, e } = makeTree();
    expect(getCommentFromPath(root, [])).toBe(root);
    expect(getCommentFromPath(root, [0, 0, 0])).toBe(c);
    expect(getCommentFromPath(root, [1])).toBe(e);
    expect(getCommentFromPath(root, [9, 2])).toBeUndefined();
  });
});

describe("applyCommentChange", () => {
  test("mutates the target in place, keeping its identity", () => {
    const { root, c } = makeTree();
    applyCommentChange(root, { ...c, author: "someone" });
    expect(getCommentFromPath(root, [0, 0, 0])).toBe(c);
    expect(c.author).toBe("someone");
  });

  test("bumps renderCount on exactly the root-to-target chain", () => {
    const { root, a, b, c, d, e } = makeTree();
    applyCommentChange(root, { ...c });
    expect([root, a, b, c, d, e].map((comment) => comment.renderCount)).toEqual(
      [1, 1, 1, 1, 0, 0],
    );
  });
});

describe("markPathDirty", () => {
  test("stops quietly at a missing node", () => {
    const { root, a } = makeTree();
    markPathDirty(root, [0, 5, 2]);
    expect(root.renderCount).toBe(1);
    expect(a.renderCount).toBe(1);
  });
});

describe("removeComment", () => {
  test("removes the comment and reindexes later siblings and their descendants", () => {
    const { root, a, b, c, d } = makeTree();
    removeComment(root, b);
    expect(a.comments).toEqual([d]);
    expect(d.path).toEqual([0, 0]);
    expect(c.path).toEqual([0, 0, 0]);
  });

  test("reindexes descendants of shifted top-level siblings", () => {
    const { root, a, e } = makeTree();
    const eChild = makeComment("eChild", [1, 0]);
    e.comments.push(eChild);

    removeComment(root, a);
    expect(root.comments).toEqual([e]);
    expect(e.path).toEqual([0]);
    expect(eChild.path).toEqual([0, 0]);
  });
});

describe("mergeMoreComments", () => {
  test("appends new comments and prunes fetched ids, idempotently", () => {
    const { root, a, b, d } = makeTree();
    a.loadMore = { depth: 1, childIds: ["x", "y", "z"] };
    const x = makeComment("x", [0, 2]);
    const y = makeComment("y", [0, 3]);

    mergeMoreComments(a, [x, y], ["x", "y"]);
    expect(a.comments).toEqual([b, d, x, y]);
    expect(a.loadMore.childIds).toEqual(["z"]);

    mergeMoreComments(a, [x, y], ["x", "y"]);
    expect(a.comments).toEqual([b, d, x, y]);
    expect(root.renderCount).toBe(0);
  });
});
