import { createContext } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

const initialValues = {
  voteIndicator: false,
  collapseAutoModerator: true,
  commentFlairs: true,
  showCommentSummary: true,
  collapseCommentSummary: false,
  tapToCollapseComment: true,
  collapseChildrenOnly: false,
};

const initialCommentSettingsContext = {
  ...initialValues,
  toggleVoteIndicator: (_newValue?: boolean) => {},
  toggleCollapseAutoModerator: (_newValue?: boolean) => {},
  toggleCommentFlairs: (_newValue?: boolean) => {},
  toggleShowCommentSummary: (_newValue?: boolean) => {},
  toggleCollapseCommentSummary: (_newValue?: boolean) => {},
  toggleTapToCollapseComment: (_newValue?: boolean) => {},
  toggleCollapseChildrenOnly: (_newValue?: boolean) => {},
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

  const [storedShowCommentSummary, setShowCommentSummary] =
    useMMKVBoolean("showCommentSummary");
  const showCommentSummary =
    storedShowCommentSummary ?? initialValues.showCommentSummary;

  const [storedCollapseCommentSummary, setCollapseCommentSummary] =
    useMMKVBoolean("collapseCommentSummary");
  const collapseCommentSummary =
    storedCollapseCommentSummary ?? initialValues.collapseCommentSummary;

  const [storedTapToCollapseComment, setTapToCollapseComment] = useMMKVBoolean(
    "tapToCollapseComment",
  );
  const tapToCollapseComment =
    storedTapToCollapseComment ?? initialValues.tapToCollapseComment;

  const [storedCollapseChildrenOnly, setCollapseChildrenOnly] = useMMKVBoolean(
    "collapseChildrenOnly",
  );
  const collapseChildrenOnly =
    storedCollapseChildrenOnly ?? initialValues.collapseChildrenOnly;

  return (
    <CommentSettingsContext.Provider
      value={{
        voteIndicator: voteIndicator ?? initialValues.voteIndicator,
        toggleVoteIndicator: (newValue = !voteIndicator) =>
          setVoteIndicator(newValue),

        collapseAutoModerator,
        toggleCollapseAutoModerator: (newValue = !collapseAutoModerator) =>
          setCollapseAutoModerator(newValue),

        commentFlairs,
        toggleCommentFlairs: (newValue = !commentFlairs) =>
          setCommentFlairs(newValue),

        showCommentSummary,
        toggleShowCommentSummary: (newValue = !showCommentSummary) =>
          setShowCommentSummary(newValue),

        collapseCommentSummary,
        toggleCollapseCommentSummary: (newValue = !collapseCommentSummary) =>
          setCollapseCommentSummary(newValue),

        tapToCollapseComment:
          tapToCollapseComment ?? initialValues.tapToCollapseComment,
        toggleTapToCollapseComment: (newValue = !tapToCollapseComment) =>
          setTapToCollapseComment(newValue),

        collapseChildrenOnly,
        toggleCollapseChildrenOnly: (newValue = !collapseChildrenOnly) =>
          setCollapseChildrenOnly(newValue),
      }}
    >
      {children}
    </CommentSettingsContext.Provider>
  );
}
