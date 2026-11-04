import { useContext } from "react";
import { UserAuth } from "../api/Authentication";
import type { VoteOption } from "../api/Posts";
import { AccountContext } from "../contexts/AccountContext";
import { ToastContext } from "../contexts/ToastContext";
import { usePostVotes, usePostVoteSession } from "../contexts/PostVoteContext";
import type { VoteItem } from "./postVotes";

export default function usePostVote(post: VoteItem) {
  const { currentUser } = useContext(AccountContext);
  const { showToast } = useContext(ToastContext);
  const votes = usePostVotes();
  const session = usePostVoteSession();
  return (direction: VoteOption) => {
    if (!UserAuth.isLoggedIn || !currentUser || !session) {
      showToast({ title: "Couldn't vote", body: "Log in to vote." });
      return;
    }
    votes.press(session, post, direction);
  };
}
