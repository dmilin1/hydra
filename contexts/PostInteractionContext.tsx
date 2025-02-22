import { createContext } from "react";

const initialMediaViewerContext = {
  interactedWithPost: () => {},
};

export const PostInteractionContext = createContext(initialMediaViewerContext);

export function PostInteractionProvider({
  onPostInteraction,
  children,
}: React.PropsWithChildren<{
  onPostInteraction: () => void;
}>) {
  return (
    <PostInteractionContext.Provider
      value={{
        interactedWithPost: onPostInteraction,
      }}
    >
      {children}
    </PostInteractionContext.Provider>
  );
}
