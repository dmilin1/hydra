import {
  createContext,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MediaViewer, {
  MediaItemCollection,
} from "../components/UI/MediaViewer.tsx/MediaViewer";
import { Post } from "../api/Posts";
import { PostDetail } from "../api/PostDetail";

type DisplayMediaDataRequest = {
  media: MediaItemCollection;
  initialIndex?: number;
  onFocusedItemChange?: (index: number) => void;
  getCurrentPost?:
    | ((rowIndex: number) => Post | PostDetail | null)
    | RefObject<(rowIndex: number) => Post | PostDetail | null>;
};

type DisplayMediaData = Omit<DisplayMediaDataRequest, "initialIndex"> & {
  startingRowIndex?: number;
  startingColumnIndex?: number;
};

type VisibilityListener = (isShowing: boolean) => void;

const initialMediaViewerContext = {
  displayMedia: (_displayMediaDataRequest: DisplayMediaDataRequest) => {},
  updateMedia: (_media: MediaItemCollection) => {},
  subscribeToVisibility:
    (_listener: VisibilityListener): (() => void) =>
    () => {},
};

export const MediaViewerContext = createContext(initialMediaViewerContext);

export function MediaViewerProvider({ children }: React.PropsWithChildren) {
  const [displayMediaData, setDisplayMediaData] =
    useState<DisplayMediaData | null>(null);

  const isShowing = useRef(false);
  const visibilityListeners = useRef<Set<VisibilityListener>>(new Set());

  /**
   * This is to avoid re-rendering consumers. If most consumers end up needing to rerender,
   * we can change this to use a sub provider instead.
   */
  useEffect(() => {
    isShowing.current = !!displayMediaData;
    visibilityListeners.current.forEach((listener) =>
      listener(isShowing.current),
    );
  }, [!!displayMediaData]);

  /**
   * Since this provider only provides functions, we need to memoize the value
   * or all consumers will re-render when the provider re-renders.
   */
  const value = useMemo(
    () => ({
      displayMedia: (data: DisplayMediaDataRequest) => {
        /**
         * Need to remap from a 1D index to 2D indices.
         */
        let rowIndex = 0;
        let columnIndex = 0;
        if (data.initialIndex !== undefined) {
          let remaining = data.initialIndex;
          while (
            rowIndex < data.media.length &&
            remaining >= data.media[rowIndex].length
          ) {
            remaining -= data.media[rowIndex].length;
            rowIndex++;
          }
          columnIndex = remaining;
        }
        setDisplayMediaData({
          ...data,
          startingRowIndex: rowIndex,
          startingColumnIndex: columnIndex,
        });
      },
      updateMedia: (media: MediaItemCollection) => {
        setDisplayMediaData((prev) =>
          prev === null
            ? null
            : {
                ...prev,
                media,
              },
        );
      },
      subscribeToVisibility: (listener: VisibilityListener) => {
        visibilityListeners.current.add(listener);
        listener(isShowing.current);
        return () => {
          visibilityListeners.current.delete(listener);
        };
      },
    }),
    [],
  );

  return (
    <MediaViewerContext.Provider value={value}>
      {displayMediaData && (
        <MediaViewer
          media={displayMediaData.media}
          onFocusedItemChange={displayMediaData.onFocusedItemChange}
          getCurrentPost={(rowIndex: number) => {
            if (typeof displayMediaData.getCurrentPost === "function") {
              return displayMediaData.getCurrentPost(rowIndex);
            } else {
              return displayMediaData.getCurrentPost?.current(rowIndex) ?? null;
            }
          }}
          startingRowIndex={displayMediaData.startingRowIndex ?? 0}
          startingColumnIndex={displayMediaData.startingColumnIndex ?? 0}
          onClose={() => setDisplayMediaData(null)}
        />
      )}
      {children}
    </MediaViewerContext.Provider>
  );
}
