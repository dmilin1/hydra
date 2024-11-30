import { createContext } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

const initialValues = {
  voteIndicator: false,
};

const initialCommentSettingsContext = {
  ...initialValues,
  toggleVoteIndicator: (_newValue?: boolean) => {},
};

export const CommentSettingsContext = createContext(
  initialCommentSettingsContext,
);

export function CommentSettingsProvider({ children }: React.PropsWithChildren) {
  const [voteIndicator, setVoteIndicator] = useMMKVBoolean("voteIndicator");

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
      }}
    >
      {children}
    </CommentSettingsContext.Provider>
  );
}
