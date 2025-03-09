import { createContext } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

const initialValues = {
  voteIndicator: false,
  collapseAutoModerator: true,
  commentFlairs: true,
};

const initialCommentSettingsContext = {
  ...initialValues,
  toggleVoteIndicator: (_newValue?: boolean) => {},
  toggleCollapseAutoModerator: (_newValue?: boolean) => {},
  toggleCommentFlairs: (_newValue?: boolean) => {},
};

export const CommentSettingsContext = createContext(
  initialCommentSettingsContext,
);

export function CommentSettingsProvider({ children }: React.PropsWithChildren) {
  const [voteIndicator, setVoteIndicator] = useMMKVBoolean("voteIndicator");
  const [storedCollapseAutoModerator, setCollapseAutoModerator] =
    useMMKVBoolean("collapseAutoModerator");
  const collapseAutoModerator =
    storedCollapseAutoModerator ?? initialValues.collapseAutoModerator;

  const [storedCommentFlairs, setCommentFlairs] =
    useMMKVBoolean("commentFlairs");
  const commentFlairs = storedCommentFlairs ?? initialValues.commentFlairs;

  const toggleVoteIndicator = (newValue = !voteIndicator) => {
    setVoteIndicator(newValue);
    alert(
      "Existing pages may need to be refreshed for this change to take effect.",
    );
  };

  return (
    <CommentSettingsContext.Provider
      value={{
        voteIndicator: voteIndicator ?? initialValues.voteIndicator,
        toggleVoteIndicator,

        collapseAutoModerator,
        toggleCollapseAutoModerator: (newValue = !collapseAutoModerator) =>
          setCollapseAutoModerator(newValue),

        commentFlairs,
        toggleCommentFlairs: (newValue = !commentFlairs) =>
          setCommentFlairs(newValue),
      }}
    >
      {children}
    </CommentSettingsContext.Provider>
  );
}
