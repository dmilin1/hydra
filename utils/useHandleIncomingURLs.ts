import Constants from "expo-constants";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useContext, useEffect, useRef, useState } from "react";
import { Alert, AppState, Platform } from "react-native";

import KeyStore from "./KeyStore";
import { incomingLink } from "../extensions/open-in-hydra/links";
import { MediaViewerContext } from "../contexts/MediaViewerContext";
import RedditURL, { PageType } from "./RedditURL";
import { PageTypeToNavName } from "./PageTypeToNavName";
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
import {
  getResolvedSharedPayloadsAsync,
  clearSharedPayloads,
} from "expo-sharing";

const CUSTOM_SCHEME_PREFIX = "hydra://openurl?url=";

export default function useHandleIncomingURLs() {
  const navigation = useNavigation<NavigationContainerRef<AppNavigationProp>>();
  const { displayMedia } = useContext(MediaViewerContext);
  const isAsking = useRef(false);
  const [navigationReady, setNavigationReady] = useState(false);

  const handleURL = (url: string) => {
    const pageType = RedditURL.getPageType(url);
    if (pageType === PageType.UNKNOWN) {
      Alert.alert("Unknown URL", `The URL ${url} cannot be handled by Hydra.`);
      return;
    }
    if (pageType === PageType.IMAGE) {
      displayMedia({ media: [[{ source: url, type: "image" }]] });
      return;
    }
    navigation.dispatch(TabActions.jumpTo("Posts"));
    navigation.dispatch(
      StackActions.push(PageTypeToNavName[pageType], {
        url: url,
      }),
    );
  };

  const handleDeepLink = (deepLink: string) => {
    if (!deepLink) return;
    const redditLink = incomingLink(
      deepLink,
      Constants.expoConfig?.extra?.hydraLinkHost ?? "",
    );
    if (redditLink) {
      handleURL(redditLink);
      return;
    }
    if (Platform.OS === "android" && !deepLink.startsWith("hydra://")) {
      /**
       * Android deep links can deliver the tapped reddit URL directly.
       */
      handleURL(deepLink);
      return;
    }
    if (!deepLink.toLowerCase().startsWith(CUSTOM_SCHEME_PREFIX)) return;
    handleURL(deepLink.slice(CUSTOM_SCHEME_PREFIX.length));
  };

  const handleClipboardURL = async () => {
    const canReadClipboard =
      KeyStore.getBoolean(READ_CLIPBOARD_KEY) ?? READ_CLIPBOARD_DEFAULT;
    if (!canReadClipboard) return;
    if (isAsking.current) return;
    isAsking.current = true;
    const clipboardURL =
      Platform.OS === "ios" || Platform.OS === "macos"
        ? await Clipboard.getUrlAsync()
        : await Clipboard.getStringAsync();
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

  const handleSharedLink = async () => {
    const payloads = await getResolvedSharedPayloadsAsync();
    if (payloads.length === 0 || !payloads[0].contentUri) return;
    handleURL(payloads[0].contentUri);
    clearSharedPayloads();
  };

  useEffect(() => {
    if (!navigationReady) return;
    handleClipboardURL();
    handleSharedLink();
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "active") {
          handleClipboardURL();
          handleSharedLink();
        }
      },
    );
    return () => subscription.remove();
  }, [navigationReady]);

  useEffect(() => {
    let cancelled = false;
    const pendingURLs: string[] = [];
    const handleIncomingURL = (url: string) => {
      if (navigation.isReady()) handleDeepLink(url);
      else pendingURLs.push(url);
    };
    const handleReady = () => {
      if (!navigation.isReady()) return;
      setNavigationReady(true);
      for (const url of pendingURLs.splice(0)) handleDeepLink(url);
    };
    const removeReadyListener = navigation.addListener("ready", handleReady);
    const subscription = Linking.addEventListener("url", (event) => {
      handleIncomingURL(event.url);
    });
    Linking.getInitialURL().then(
      (initialURL) => {
        if (!cancelled && initialURL) handleIncomingURL(initialURL);
      },
      () => undefined,
    );
    handleReady();
    return () => {
      cancelled = true;
      removeReadyListener();
      subscription.remove();
    };
  }, [navigation]);
}
