import { assertOk, defineOperation, gql } from "./GqlApi";
import { Comment, PostDetail } from "../PostDetail";
import { Post } from "../Posts";

const UpdatePostSaveState = defineOperation(
  "UpdatePostSaveState",
  "96dbe868ad5b00109ed72048a82290abb86f66ff653cde724458b6f7549918f8",
);

const UpdateCommentSaveState = defineOperation(
  "UpdateCommentSaveState",
  "2d2a823e0b5053d39de7d319fd8ccf8b87ddf0ab3ad97cfd621d82f376fcf174",
);

export async function saveItem(
  item: Post | PostDetail | Comment,
  saved: boolean,
): Promise<void> {
  const [operation, field, idKey] = item.name.startsWith("t3_")
    ? [UpdatePostSaveState, "updatePostSaveState", "postId"]
    : [UpdateCommentSaveState, "updateCommentSaveState", "commentId"];
  const data = await gql(operation, {
    input: { [idKey]: item.name, saveState: saved ? "SAVED" : "NONE" },
  });
  assertOk(data[field], "Failed to save");
}
