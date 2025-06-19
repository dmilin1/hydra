import * as Clipboard from "expo-clipboard";
import { useLinkingURL } from "expo-linking";
import { PropsWithChildren, useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";

import KeyStore from "./KeyStore";
import RedditURL from "./RedditURL";
import { useURLNavigation } from "./navigation";
import {
  READ_CLIPBOARD_DEFAULT,
  READ_CLIPBOARD_KEY,
} from "../pages/SettingsPage/General/OpenInHydra";
import { AppNavigationProp } from "./navigationTypes";

export default function IncomingURLHandler({ children }: PropsWithChildren) {
  const { pushURL, navigate } = useURLNavigation<AppNavigationProp>();
  const isAsking = useRef(false);

  const deepLink = useLinkingURL()?.toLocaleLowerCase();

  const handleDeepLink = () => {
    if (!deepLink || !deepLink.startsWith("hydra://openurl?url=")) return;
    const url = deepLink.replace("hydra://openurl?url=", "");
    pushURL(url);
    navigate("Posts"); /* Set tab */
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
            navigate("Posts"); /* Set tab */
            Clipboard.setUrlAsync("");
            pushURL(clipboardURL);
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
    handleDeepLink();
  }, [deepLink]);

  return children;
}
