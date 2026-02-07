import { createContext, useMemo, useState } from "react";

import ImageView from "../components/RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageView";
import useMediaSharing from "../utils/useMediaSharing";

const initialMediaViewerContext = {
  displayMedia: (_url: string) => {},
};

export const MediaViewerContext = createContext(initialMediaViewerContext);

export function MediaViewerProvider({ children }: React.PropsWithChildren) {
  const [url, setUrl] = useState<string>();

  const shareMedia = useMediaSharing();

  /**
   * Since this provider only provides functions, we need to memoize the value
   * or all consumers will re-render when the provider re-renders.
   */
  const value = useMemo(
    () => ({
      displayMedia: setUrl,
    }),
    [],
  );

  return (
    <MediaViewerContext.Provider value={value}>
      {url && (
        <ImageView
          images={[{ uri: url }]}
          initialImageIndex={0}
          presentationStyle="overFullScreen"
          animationType="none"
          visible
          onRequestClose={() => setUrl(undefined)}
          onLongPress={() => shareMedia("image", url)}
          delayLongPress={500}
        />
      )}
      {children}
    </MediaViewerContext.Provider>
  );
}
