import { assertOk, defineOperation, gql } from "./GqlApi";
import { Comment, PostDetail } from "../PostDetail";
import { modifyStat, Stat } from "../../db/functions/Stats";

const CreateComment = defineOperation(
  "CreateComment",
  "2e8285b8591b0a4af3a8d1dec0194ca472837013fd444ad613c957fa5424c1ce",
);

const UpdatePost = defineOperation(
  "UpdatePost",
  "57f90e3c6f02d0ee7c22d5128b8b9bd6584ee98417f9c47be485298259dd24ff",
);

const UpdateComment = defineOperation(
  "UpdateComment",
  "c43517a749d070bc2d19b123fbdb680de815f4b92c7720ccb9010c2eb0a4a4f8",
);

const DeletePost = defineOperation(
  "DeletePost",
  "4273f1b33ccd13e613cf7c56804f8b753b5364df9f17705a7924efc9c9917881",
);

const DeleteComment = defineOperation(
  "DeleteComment",
  "e9ffb38ef6f33293f6e6e4f8a444827023bd4e988a0c5ebda8c7c60033261467",
);

/**
 * Comments on a post, or replies to a comment. Throws Reddit's reason when it
 * refuses.
 */
export async function submitComment(
  parent: Comment | PostDetail,
  text: string,
): Promise<void> {
  // Like Reddit's app: postId for top-level comments, parentId for replies.
  const data = await gql(CreateComment, {
    input: {
      ...(parent.name.startsWith("t3_")
        ? { postId: parent.name }
        : { parentId: parent.name }),
      content: { markdown: text },
    },
  });
  assertOk(data.createComment, "Failed to submit comment");
  modifyStat(Stat.COMMENTS_CREATED, 1);
}

/**
 * Replaces a post's or comment's markdown. Throws Reddit's reason when it
 * refuses.
 */
export async function editUserContent(
  userContent: Comment | PostDetail,
  text: string,
): Promise<void> {
  const content = { markdown: text };
  if (userContent.name.startsWith("t3_")) {
    const data = await gql(UpdatePost, {
      input: { postId: userContent.name, content },
    });
    assertOk(data.updatePost, "Failed to edit post");
    return;
  }
  const data = await gql(UpdateComment, {
    input: { commentId: userContent.name, content },
  });
  assertOk(data.updateComment, "Failed to edit comment");
}

export async function deleteUserContent(
  userContent: Comment | PostDetail,
): Promise<void> {
  const [operation, field, idKey] = userContent.name.startsWith("t3_")
    ? [DeletePost, "deletePost", "postId"]
    : [DeleteComment, "deleteComment", "commentId"];
  const data = await gql(operation, { input: { [idKey]: userContent.name } });
  assertOk(data[field], "Failed to delete");
}
