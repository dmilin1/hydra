import { NativeModule, requireNativeModule } from "expo-modules-core";

type MuxProgressEvent = {
  /** Echoes mux()'s outputUri so overlapping muxes can be told apart. */
  outputUri: string;
  progress: number;
};

declare class AvMuxNativeModule extends NativeModule<{
  onMuxProgress: (event: MuxProgressEvent) => void;
}> {
  mux(videoUri: string, audioUri: string, outputUri: string): Promise<void>;
}

const AvMux = requireNativeModule<AvMuxNativeModule>("AvMux");

export type MuxOptions = {
  /** file:// URI of a local video file (extra audio tracks in it are dropped). */
  videoUri: string;
  /** file:// URI of a local audio file. */
  audioUri: string;
  /** file:// URI to write the combined mp4 to. Replaced if it already exists. */
  outputUri: string;
  /**
   * Called with a 0–1 fraction. The native side stays below 1 because its
   * progress counts samples copied, not the container being finalized; 1 is
   * reported here once the file is fully written and safe to hand off.
   */
  onProgress?: (progress: number) => void;
};

/**
 * Combines a video file and an audio file into a single mp4 by remuxing the
 * container — no re-encode, so it finishes in roughly file-copy time. The
 * tracks must already be mp4-compatible codecs (H.264/HEVC + AAC), which is
 * what Reddit's DASH streams use. Audio longer than the video is trimmed to
 * the video's duration.
 */
export async function mux({
  videoUri,
  audioUri,
  outputUri,
  onProgress,
}: MuxOptions): Promise<void> {
  const subscription = onProgress
    ? AvMux.addListener("onMuxProgress", (event) => {
        if (event.outputUri === outputUri) {
          onProgress(event.progress);
        }
      })
    : null;
  try {
    await AvMux.mux(videoUri, audioUri, outputUri);
    onProgress?.(1);
  } finally {
    subscription?.remove();
  }
}
