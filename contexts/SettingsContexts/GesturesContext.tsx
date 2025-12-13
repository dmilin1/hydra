import { createContext } from "react";
import { useMMKVBoolean, useMMKVObject } from "react-native-mmkv";

const initialValues = {
  swipeAnywhereToNavigate: false,
  postSwipeOptions: {
    farRight: "downvote",
    right: "upvote",
    farLeft: "bookmark",
    left: "hide",
  } as PostSwipeOptions,
  commentSwipeOptions: {
    farRight: "downvote",
    right: "upvote",
    farLeft: "bookmark",
    left: "reply",
  } as CommentSwipeOptions,
};

const initialGesturesContext = {
  ...initialValues,
  toggleSwipeAnywhereToNavigate: (_newValue?: boolean) => {},
  setPostSwipeOption: (
    _option: keyof PostSwipeOptions,
    _value: PostSwipeOption,
  ) => {},
  setCommentSwipeOption: (
    _option: keyof CommentSwipeOptions,
    _value: CommentSwipeOption,
  ) => {},
};

export const GesturesContext = createContext(initialGesturesContext);

export const POST_SWIPE_OPTIONS = [
  {
    label: "Upvote",
    value: "upvote",
  },
  {
    label: "Downvote",
    value: "downvote",
  },
  {
    label: "Mark as Read",
    value: "hide",
  },
  {
    label: "Bookmark",
    value: "bookmark",
  },
  {
    label: "Share",
    value: "share",
  },
] as const;

export const COMMENT_SWIPE_OPTIONS = [
  {
    label: "Upvote",
    value: "upvote",
  },
  {
    label: "Downvote",
    value: "downvote",
  },
  {
    label: "Reply",
    value: "reply",
  },
  {
    label: "Bookmark",
    value: "bookmark",
  },
  {
    label: "Share",
    value: "share",
  },
  {
    label: "Collapse",
    value: "collapse",
  },
  {
    label: "Collapse Thread",
    value: "collapseThread",
  },
] as const;

export type PostSwipeOption = (typeof POST_SWIPE_OPTIONS)[number]["value"];
export type CommentSwipeOption =
  (typeof COMMENT_SWIPE_OPTIONS)[number]["value"];

type PostSwipeOptions = {
  farRight: PostSwipeOption;
  right: PostSwipeOption;
  farLeft: PostSwipeOption;
  left: PostSwipeOption;
};

type CommentSwipeOptions = {
  farRight: CommentSwipeOption;
  right: CommentSwipeOption;
  farLeft: CommentSwipeOption;
  left: CommentSwipeOption;
};

export function GesturesProvider({ children }: React.PropsWithChildren) {
  const [storedSwipeAnywhereToNavigate, setSwipeAnywhereToNavigate] =
    useMMKVBoolean("swipeAnywhereToNavigate");
  const swipeAnywhereToNavigate =
    storedSwipeAnywhereToNavigate ?? initialValues.swipeAnywhereToNavigate;

  const [storedPostSwipeOptions, setPostSwipeOptions] =
    useMMKVObject<PostSwipeOptions>("postSwipeOptions");
  const postSwipeOptions =
    storedPostSwipeOptions ?? initialValues.postSwipeOptions;

  const [storedCommentSwipeOptions, setCommentSwipeOptions] =
    useMMKVObject<CommentSwipeOptions>("commentSwipeOptions");
  const commentSwipeOptions =
    storedCommentSwipeOptions ?? initialValues.commentSwipeOptions;

  const getKeyToSwitchWith = (
    options: PostSwipeOptions | CommentSwipeOptions,
    option: keyof PostSwipeOptions | keyof CommentSwipeOptions,
    value: PostSwipeOption | CommentSwipeOption,
  ) => {
    let keyToSwitchWith:
      | null
      | keyof PostSwipeOptions
      | keyof CommentSwipeOptions = null;
    for (const key in options) {
      const currentKey = key as
        | keyof PostSwipeOptions
        | keyof CommentSwipeOptions;
      if (currentKey === option) continue;
      if (options[currentKey] === value) {
        keyToSwitchWith = currentKey;
        break;
      }
    }
    return keyToSwitchWith;
  };

  const setPostSwipeOption = (
    option: keyof PostSwipeOptions,
    value: PostSwipeOption,
  ) => {
    const keyToSwitchWith = getKeyToSwitchWith(postSwipeOptions, option, value);
    setPostSwipeOptions({
      ...postSwipeOptions,
      [option]: value,
      ...(keyToSwitchWith
        ? {
            [keyToSwitchWith]: postSwipeOptions[option],
          }
        : {}),
    });
  };

  const setCommentSwipeOption = (
    option: keyof CommentSwipeOptions,
    value: CommentSwipeOption,
  ) => {
    const keyToSwitchWith = getKeyToSwitchWith(
      commentSwipeOptions,
      option,
      value,
    );
    setCommentSwipeOptions({
      ...commentSwipeOptions,
      [option]: value,
      ...(keyToSwitchWith
        ? {
            [keyToSwitchWith]: commentSwipeOptions[option],
          }
        : {}),
    });
  };

  return (
    <GesturesContext.Provider
      value={{
        swipeAnywhereToNavigate,
        toggleSwipeAnywhereToNavigate: (newValue = !swipeAnywhereToNavigate) =>
          setSwipeAnywhereToNavigate(newValue),
        postSwipeOptions,
        setPostSwipeOption,
        commentSwipeOptions,
        setCommentSwipeOption,
      }}
    >
      {children}
    </GesturesContext.Provider>
  );
}
