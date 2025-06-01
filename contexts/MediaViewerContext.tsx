import { createContext, useState } from "react";

import ImageView from "../components/RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageView";
import useImageMenu from "../utils/useImageMenu";

const initialMediaViewerContext = {
  displayMedia: (_url: string) => {},
};

export const MediaViewerContext = createContext(initialMediaViewerContext);

export function MediaViewerProvider({ children }: React.PropsWithChildren) {
  const [url, setUrl] = useState<string>();

  const showImageMenu = useImageMenu();

  return (
    <MediaViewerContext.Provider
      value={{
        displayMedia: setUrl,
      }}
    >
      {url && (
        <ImageView
          images={[{ uri: url }]}
          initialImageIndex={0}
          presentationStyle="overFullScreen"
          animationType="none"
          visible
          onRequestClose={() => setUrl(undefined)}
          onLongPress={() => showImageMenu(url)}
          delayLongPress={500}
        />
      )}
      {children}
    </MediaViewerContext.Provider>
  );
}
