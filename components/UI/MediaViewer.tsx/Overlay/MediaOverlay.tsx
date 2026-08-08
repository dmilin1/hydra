import { VideoPlayer } from "expo-video";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Post } from "../../../../api/Posts";
import { PostDetail } from "../../../../api/PostDetail";
import { MediaItem } from "../types";
import AlbumNavigation from "./AlbumNavigation";
import { SaveMediaButton, ShareMediaButton } from "./MediaActionButtons";
import {
  OVERLAY_BACKGROUND_COLOR,
  OverlayInteractionContext,
  OverlayIsland,
} from "./OverlayContext";
import PostInfoHeader from "./PostInfoHeader";
import { PlaybackCluster, PlaybackRateButton } from "./VideoPlaybackControls";
import VideoSeekBar from "./VideoSeekBar";

const AUTO_HIDE_MS = 3500;

export type MediaOverlayHandle = {
  toggle: () => void;
};

type MediaOverlayProps = {
  post: Post | PostDetail | null;
  focusedItem: MediaItem | undefined;
  player: VideoPlayer | null;
  albumIndex: number;
  albumSize: number;
  onAlbumStep: (direction: "left" | "right") => void;
  closeViewer: () => void;
};

/**
 * The full chrome layer of the media viewer. Owns its own visibility: it
 * starts shown, fades out after a few seconds of video playback, and the
 * viewer toggles it through the imperative handle when the content is tapped.
 */
const MediaOverlay = forwardRef<MediaOverlayHandle, MediaOverlayProps>(
  function MediaOverlay(
    {
      post,
      focusedItem,
      player,
      albumIndex,
      albumSize,
      onAlbumStep,
      closeViewer,
    },
    ref,
  ) {
    const insets = useSafeAreaInsets();

    const [visible, setVisible] = useState(true);
    const visibleRef = useRef(true);
    const opacity = useRef(new Animated.Value(1));
    const isPlayingRef = useRef(false);
    const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const videoItem =
      focusedItem?.type === "video" && !focusedItem.source.sourceLoadError
        ? focusedItem
        : null;
    const showVideoControls = !!videoItem && !!player;

    const cancelAutoHide = () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
    };

    const bumpAutoHide = () => {
      cancelAutoHide();
      hideTimeout.current = setTimeout(() => {
        hideTimeout.current = null;
        if (isPlayingRef.current) {
          setVisibility(false);
        }
      }, AUTO_HIDE_MS);
    };

    const setVisibility = (shown: boolean) => {
      visibleRef.current = shown;
      setVisible(shown);
      Animated.timing(opacity.current, {
        toValue: shown ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      if (shown) {
        bumpAutoHide();
      } else {
        cancelAutoHide();
      }
    };

    useImperativeHandle(ref, () => ({
      toggle: () => setVisibility(!visibleRef.current),
    }));

    /**
     * Playback drives the countdown: controls stay up while the video is
     * paused, and scrubbing pauses the video so it suspends the countdown
     * for free.
     */
    useEffect(() => {
      if (!player) {
        isPlayingRef.current = false;
        cancelAutoHide();
        return;
      }
      const applyPlaying = (playing: boolean) => {
        isPlayingRef.current = playing;
        if (playing) {
          bumpAutoHide();
        } else {
          cancelAutoHide();
        }
      };
      applyPlaying(player.playing);
      const subscription = player.addListener("playingChange", (e) =>
        applyPlaying(e.isPlaying),
      );
      return () => subscription.remove();
    }, [player]);

    useEffect(() => () => cancelAutoHide(), []);

    return (
      <Animated.View
        style={[
          styles.overlay,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            opacity: opacity.current,
          },
        ]}
        pointerEvents={visible ? "box-none" : "none"}
      >
        <OverlayInteractionContext.Provider value={{ bumpAutoHide }}>
          {post ? (
            <PostInfoHeader post={post} closeViewer={closeViewer} />
          ) : null}
          <View style={styles.middle} pointerEvents="box-none">
            {showVideoControls ? (
              <PlaybackCluster
                key={`cluster-${videoItem.source.source}`}
                player={player}
              />
            ) : null}
          </View>
          <View style={styles.bottom} pointerEvents="box-none">
            {showVideoControls ? (
              <>
                {albumSize > 1 ? (
                  <AlbumNavigation
                    albumIndex={albumIndex}
                    albumSize={albumSize}
                    onStep={onAlbumStep}
                  />
                ) : null}
                <View style={styles.videoActionsContainer}>
                  <OverlayIsland>
                    <PlaybackRateButton player={player} />
                  </OverlayIsland>
                  <OverlayIsland style={styles.videoSaveActionsContainer}>
                    <SaveMediaButton item={videoItem} />
                    <ShareMediaButton item={videoItem} />
                  </OverlayIsland>
                </View>
                <OverlayIsland
                  key={videoItem.source.source}
                  style={styles.controlsCard}
                >
                  <VideoSeekBar player={player} />
                </OverlayIsland>
              </>
            ) : focusedItem?.type === "image" ? (
              <>
                <OverlayIsland style={styles.imageActionsRow}>
                  <SaveMediaButton item={focusedItem} />
                  <ShareMediaButton item={focusedItem} />
                </OverlayIsland>
                {albumSize > 1 ? (
                  <AlbumNavigation
                    albumIndex={albumIndex}
                    albumSize={albumSize}
                    onStep={onAlbumStep}
                  />
                ) : null}
              </>
            ) : null}
          </View>
        </OverlayInteractionContext.Provider>
      </Animated.View>
    );
  },
);

export default MediaOverlay;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  middle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    gap: 10,
  },
  controlsCard: {
    marginHorizontal: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: OVERLAY_BACKGROUND_COLOR,
  },
  videoActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  videoSaveActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionsSpacer: {
    flex: 1,
  },
  imageActionsRow: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginRight: 10,
    gap: 10,
  },
});
