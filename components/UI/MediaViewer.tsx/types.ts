import { ImageSource } from "expo-image";
import { Post } from "../../../api/Posts";
import { PostDetail } from "../../../api/PostDetail";

export type ImageItem = {
  type: "image";
  source: string | ImageSource[];
};

export type VideoItem = {
  type: "video";
  source: Post["videos"][number];
};

export type MediaItem = ImageItem | VideoItem;

export type MediaItemRow = MediaItem[];

export type MediaItemCollection = MediaItemRow[];

export type MediaViewerProps = {
  media: MediaItemCollection;
  startingRowIndex: number;
  startingColumnIndex: number;
  onFocusedItemChange?: (index: number) => void;
  getCurrentPost?: (rowIndex: number) => Post | PostDetail | null;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  onClose: () => void;
};
