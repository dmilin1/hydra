import * as Clipboard from "expo-clipboard";
import { useLinkingURL } from "expo-linking";
import { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";

import KeyStore from "./KeyStore";
import RedditURL, { PageType } from "./RedditURL";
import { PageTypeToNavName } from "./navigation";
import {
  READ_CLIPBOARD_DEFAULT,
  READ_CLIPBOARD_KEY,
} from "../pages/SettingsPage/General/OpenInHydra";
import { AppNavigationProp } from "./navigationTypes";
import {
  NavigationContainerRef,
  StackActions,
  TabActions,
  useNavigation,
} from "@react-navigation/native";

export default function useHandleIncomingURLs() {
  const navigation = useNavigation<NavigationContainerRef<AppNavigationProp>>();
  const isAsking = useRef(false);

  const deepLink = useLinkingURL()?.toLocaleLowerCase();

  const handleURL = (url: string) => {
    const pageType = RedditURL.getPageType(url);
    if (pageType === PageType.UNKNOWN) {
      Alert.alert("Unknown URL", `The URL ${url} cannot be handled by Hydra.`);
      return;
    }
    navigation.dispatch(TabActions.jumpTo("Posts"));
    navigation.dispatch(
      StackActions.push(PageTypeToNavName[pageType], {
        url: url,
      }),
    );
  };

  const handleDeepLink = () => {
    if (!deepLink || !deepLink.startsWith("hydra://openurl?url=")) return;
    const url = deepLink.replace("hydra://openurl?url=", "");
    handleURL(url);
  };

  const handleClipboardURL = async () => {
    const canReadClipboard =
      KeyStore.getBoolean(READ_CLIPBOARD_KEY) ?? READ_CLIPBOARD_DEFAULT;
    if (!canReadClipboard) return;
    if (isAsking.current) return;
    isAsking.current = true;
    const clipboardURL = await Clipboard.getUrlAsync();
    if (!clipboardURL) return;
    try {
      new RedditURL(clipboardURL);
    } catch (_e) {
      // Not a Reddit URL Hydra can handle
      return;
    }
    Alert.alert(
      "Open Reddit URL?",
      `A Reddit URL was detected on your clipboard. Would you like to open it?\n\n ${clipboardURL}`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            Clipboard.setUrlAsync("");
            isAsking.current = false;
          },
        },
        {
          text: "Open",
          onPress: () => {
            Clipboard.setUrlAsync("");
            handleURL(clipboardURL);
            isAsking.current = false;
          },
        },
      ],
    );
  };

  useEffect(() => {
    handleClipboardURL();
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "active") {
          handleClipboardURL();
        }
      },
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!navigation.isReady()) return;
    handleDeepLink();
  }, [deepLink, navigation.isReady()]);
}
