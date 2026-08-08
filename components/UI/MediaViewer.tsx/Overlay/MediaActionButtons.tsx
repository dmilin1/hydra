import Feather from "@react-native-vector-icons/feather";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { ReactElement, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { useMediaSaving, useMediaSharing } from "../../../../utils/sharing";
import ProgressRing from "../../ProgressRing";
import { MediaItem } from "../types";
import {
  OVERLAY_BACKGROUND_COLOR,
  useOverlayInteraction,
} from "./OverlayContext";

const mediaSourceOf = (item: MediaItem) =>
  item.type === "image" ? item.source : item.source.source;

function MediaActionButton({
  icon,
  action,
}: {
  icon: ReactElement;
  action: (onProgress: (progress: number) => void) => Promise<boolean>;
}) {
  const { bumpAutoHide } = useOverlayInteraction();

  const [isBusy, setIsBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCheck, setShowCheck] = useState(false);
  const checkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }
    };
  }, []);

  return (
    <Touchable
      activeOpacity={0.2}
      animationDuration={{ in: 0, out: 150 }}
      style={styles.actionButton}
      disabled={isBusy}
      onPress={async () => {
        bumpAutoHide();
        setIsBusy(true);
        const succeeded = await action((newProgress) =>
          setProgress(newProgress),
        );
        setIsBusy(false);
        setProgress(0);
        bumpAutoHide();
        if (succeeded) {
          setShowCheck(true);
          checkTimeout.current = setTimeout(() => setShowCheck(false), 2000);
        }
      }}
    >
      {isBusy && <ProgressRing progress={progress} size={40} />}
      {isBusy ? (
        <ActivityIndicator size="small" color="white" />
      ) : showCheck ? (
        <MaterialIcons name="check" size={22} color="white" />
      ) : (
        icon
      )}
    </Touchable>
  );
}

export function ShareMediaButton({ item }: { item: MediaItem }) {
  const shareMedia = useMediaSharing();

  return (
    <MediaActionButton
      icon={
        <MaterialIcons
          name="ios-share"
          size={22}
          color="white"
          style={styles.shareIcon}
        />
      }
      action={async (onProgress) => {
        await shareMedia(item.type, mediaSourceOf(item), onProgress);
        return false;
      }}
    />
  );
}

export function SaveMediaButton({ item }: { item: MediaItem }) {
  const saveMedia = useMediaSaving();

  return (
    <MediaActionButton
      icon={<Feather name="download" size={22} color="white" />}
      action={(onProgress) =>
        saveMedia(item.type, mediaSourceOf(item), onProgress)
      }
    />
  );
}

const styles = StyleSheet.create({
  actionButton: {
    width: 40,
    aspectRatio: 1,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OVERLAY_BACKGROUND_COLOR,
  },
  shareIcon: {
    marginTop: -2,
  },
});
