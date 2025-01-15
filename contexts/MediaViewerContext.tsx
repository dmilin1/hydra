import { createContext, useState } from "react";

import ImageView from "../components/RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageView";
import useSaveImage from "../utils/useSaveImage";

const initialMediaViewerContext = {
  displayMedia: (_url: string) => {},
};

export const MediaViewerContext = createContext(initialMediaViewerContext);

export function MediaViewerProvider({ children }: React.PropsWithChildren) {
  const [url, setUrl] = useState<string>();

  const saveImage = useSaveImage();

  return (
    <MediaViewerContext.Provider
      value={{
        displayMedia: setUrl,
      }}
    >
      {url && (
        <ImageView
          images={[{ uri: url }]}
          imageIndex={0}
          presentationStyle="overFullScreen"
          animationType="none"
          visible
          onRequestClose={() => setUrl(undefined)}
          onLongPress={() => saveImage(url)}
          delayLongPress={500}
        />
      )}
      {children}
    </MediaViewerContext.Provider>
  );
}
