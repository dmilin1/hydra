import { assertOk, defineOperation, gql } from "./GqlApi";
import { VoteOption } from "../Posts";
import { UserContent } from "../User";
import { modifyStat, Stat } from "../../db/functions/Stats";

const UpdatePostVoteState = defineOperation(
  "UpdatePostVoteState",
  "2523ed203f983488aab97d84f12b46910008244b79a61073b419e33ff98cb7e5",
);

const UpdateCommentVoteState = defineOperation(
  "UpdateCommentVoteState",
  "a353fb29741128e9346380c4706af0bf59fc5767608ea6848039c57ae0b08fec",
);

const VOTE_STATES: Record<VoteOption, string> = {
  [VoteOption.UpVote]: "UP",
  [VoteOption.NoVote]: "NONE",
  [VoteOption.DownVote]: "DOWN",
};

/**
 * Votes on a post or comment. Voting the way the item is already voted
 * removes the vote. Returns the item's new vote.
 */
export async function vote(
  item: UserContent,
  voteOption: VoteOption,
): Promise<VoteOption> {
  const dir = item.userVote === voteOption ? VoteOption.NoVote : voteOption;
  const isPost = item.name.startsWith("t3_");
  const [operation, field, idKey] = isPost
    ? [UpdatePostVoteState, "updatePostVoteState", "postId"]
    : [UpdateCommentVoteState, "updateCommentVoteState", "commentId"];
  const data = await gql(operation, {
    input: { [idKey]: item.name, voteState: VOTE_STATES[dir] },
  });
  assertOk(data[field], "Failed to vote");

  if (dir === VoteOption.UpVote) {
    modifyStat(isPost ? Stat.POST_UPVOTES : Stat.COMMENT_UPVOTES, 1);
  } else if (dir === VoteOption.DownVote) {
    modifyStat(isPost ? Stat.POST_DOWNVOTES : Stat.COMMENT_DOWNVOTES, 1);
  }

  return dir;
}
