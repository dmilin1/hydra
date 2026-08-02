import { useContext, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Share,
  View,
  StyleSheet,
  Text,
  Platform,
} from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { ImageSource } from "expo-image";
import { shareAsync } from "expo-sharing";

import { ModalContext } from "../contexts/ModalContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { download, UserCancelledVideoMuxError } from "./download";
import { SubscriptionsContext } from "../contexts/SubscriptionsContext";
import {
  NavigationContainerRef,
  StackActions,
  TabActions,
  useNavigation,
} from "@react-navigation/native";
import { AppNavigationProp } from "./navigationTypes";
import { PageTypeToNavName } from "./PageTypeToNavName";
import { PageType } from "./RedditURL";
import { MediaViewerContext } from "../contexts/MediaViewerContext";

export function shareURL(url: string) {
  return Share.share(Platform.OS === "ios" ? { url } : { message: url });
}

export function useMediaSharing() {
  const { setModal } = useContext(ModalContext);
  const { theme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);
  const { closeMediaViewer } = useContext(MediaViewerContext);

  const navigation = useNavigation<NavigationContainerRef<AppNavigationProp>>();

  const alreadyAsking = useRef(false);

  return async (
    type: "image" | "video",
    mediaSource: string | ImageSource[],
    onProgress?: (progress: number) => void,
  ) => {
    if (alreadyAsking.current) return;
    alreadyAsking.current = true;
    const mediaUrl =
      typeof mediaSource === "string" ? mediaSource : mediaSource.at(-1)?.uri;
    if (!mediaUrl) {
      alreadyAsking.current = false;
      return;
    }
    try {
      if (!onProgress) {
        setModal(
          <Touchable
            style={styles.modalContainer}
            onPress={() => setModal(null)}
          >
            <View
              style={[
                styles.modal,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.divider,
                },
              ]}
            >
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Preparing {type === "image" ? "Image" : "Video"}...
              </Text>
              <ActivityIndicator size="small" />
            </View>
          </Touchable>,
        );
      }
      const { file, cleanup } = await download({
        url: mediaUrl,
        isPro,
        onProgress,
      });
      setModal(null);
      if (Platform.OS === "ios") {
        await Share.share({
          url: file.uri,
        });
      } else {
        await shareAsync(file.uri, {
          mimeType: type === "image" ? "image/jpeg" : "video/mp4",
        });
      }
      cleanup();
    } catch (e) {
      if (e instanceof UserCancelledVideoMuxError) {
        closeMediaViewer();
        navigation.dispatch(TabActions.jumpTo("Posts"));
        navigation.dispatch(
          StackActions.push(PageTypeToNavName[PageType.SETTINGS], {
            url: "hydra://settings/hydraPro",
          }),
        );
      } else {
        Alert.alert("Error", `Failed to download ${type}`);
      }
      setModal(null);
    }
    alreadyAsking.current = false;
  };
}

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
  },
});
