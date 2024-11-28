import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

type CommentSettingsContextType = {
  voteIndicator: boolean;
  toggleVoteIndicator: (newValue?: boolean) => void;
};

const initialValues = {
  voteIndicator: false,
};

const initialCommentSettingsContext: CommentSettingsContextType = {
  ...initialValues,
  toggleVoteIndicator: () => {},
};

type SettingsLoaders = {
  [Key in keyof typeof initialValues]: {
    key: Key;
    setFn: React.Dispatch<React.SetStateAction<(typeof initialValues)[Key]>>;
  };
}[keyof typeof initialValues][];

export const CommentSettingsContext = createContext(
  initialCommentSettingsContext,
);

export function CommentSettingsProvider({ children }: React.PropsWithChildren) {
  const [voteIndicator, setVoteIndicator] = useState(
    initialCommentSettingsContext.voteIndicator,
  );

  const toggleVoteIndicator = (newValue = !voteIndicator) => {
    setVoteIndicator((prev) => !prev);
    AsyncStorage.setItem("voteIndicator", JSON.stringify(newValue));
    alert(
      "Existing pages may need to be refreshed for this change to take effect.",
    );
  };

  const loadSavedData = () => {
    const settingsLoaders: SettingsLoaders = [
      {
        key: "voteIndicator",
        setFn: setVoteIndicator,
      },
    ];
    settingsLoaders.forEach(({ key, setFn }) => {
      AsyncStorage.getItem(key).then((str) => {
        if (str) {
          let val = JSON.parse(str);
          if (typeof initialCommentSettingsContext[key] === "number") {
            val = Number(val);
          }
          setFn(JSON.parse(val));
        }
      });
    });
  };

  useEffect(() => loadSavedData(), []);

  return (
    <CommentSettingsContext.Provider
      value={{
        voteIndicator,
        toggleVoteIndicator,
      }}
    >
      {children}
    </CommentSettingsContext.Provider>
  );
}
