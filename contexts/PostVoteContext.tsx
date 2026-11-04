import { createContext, useContext, useEffect, useState } from "react";
import { setVote } from "../api/gql/Vote";
import {
  isWebSessionCurrent,
  WebSessionChangedError,
} from "../api/gql/WebToken";
import { createPostVotes } from "../utils/postVotes";
import { AccountContext } from "./AccountContext";
import { ToastContext } from "./ToastContext";

const PostVoteContext = createContext<ReturnType<
  typeof createPostVotes
> | null>(null);

export function PostVoteProvider({ children }: React.PropsWithChildren) {
  const { showToast } = useContext(ToastContext);
  const [votes] = useState(() =>
    createPostVotes(setVote, isWebSessionCurrent, (error) => {
      if (!(error instanceof WebSessionChangedError))
        showToast({
          title: "Vote Failed",
          body: "Your vote wasn't confirmed, Please try again.",
        });
    }),
  );
  useEffect(() => () => votes.clear(), [votes]);
  return (
    <PostVoteContext.Provider value={votes}>
      {children}
    </PostVoteContext.Provider>
  );
}

export function usePostVotes() {
  const votes = useContext(PostVoteContext);
  if (!votes) throw new Error("PostVoteProvider is missing");
  return votes;
}

export function usePostVoteSession() {
  return useContext(AccountContext).webSession;
}
