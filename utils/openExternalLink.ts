import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import KeyStore from "./KeyStore";
import { Alert } from "react-native";

export type BrowserOption = keyof typeof BROWSER_CONFIGS;

export const EXTERNAL_LINK_BROWSER_KEY = "externalLinkBrowser";
export const EXTERNAL_LINK_BROWSER_DEFAULT = "internalBrowser";

export const OPEN_IN_READER_MODE_DEFAULT = false;
export const OPEN_IN_READER_MODE_KEY = "openInReaderMode";

export const BROWSER_CONFIGS = {
  internalBrowser: {
    value: "internalBrowser",
    label: "Hydra",
    getURLScheme: (url: string) => url,
  },
  defaultBrowser: {
    value: "defaultBrowser",
    label: "Default Browser",
    getURLScheme: (url: string) => url,
  },
  chrome: {
    value: "chrome",
    label: "Chrome",
    getURLScheme: (url: string) => {
      const isHTTPS = url.startsWith("https://");
      const cleanURL = url.replace(/^https?:\/\//, "");
      return isHTTPS
        ? `googlechromes://${cleanURL}`
        : `googlechrome://${cleanURL}`;
    },
  },
  brave: {
    value: "brave",
    label: "Brave",
    getURLScheme: (url: string) => {
      const isHTTPS = url.startsWith("https://");
      const cleanURL = url.replace(/^https?:\/\//, "");
      return isHTTPS ? `braves://${cleanURL}` : `brave://${cleanURL}`;
    },
  },
  firefox: {
    value: "firefox",
    label: "Firefox",
    getURLScheme: (url: string) => {
      const encodedURL = encodeURIComponent(url);
      return `firefox-open-url:?url=${encodedURL}`;
    },
  },
  edge: {
    value: "edge",
    label: "Edge",
    getURLScheme: (url: string) => {
      const isHTTPS = url.startsWith("https://");
      return isHTTPS
        ? url.replace(/^https:\/\//, "microsoft-edge-https://")
        : url.replace(/^http:\/\//, "microsoft-edge-http://");
    },
  },
  opera: {
    value: "opera",
    label: "Opera",
    getURLScheme: (url: string) => {
      const isHTTPS = url.startsWith("https://");
      return isHTTPS
        ? url.replace(/^https:\/\//, "opera-https://")
        : url.replace(/^http:\/\//, "opera-http://");
    },
  },
};

export async function openExternalLink(
  url: string,
  browserParams?: WebBrowser.WebBrowserOpenOptions,
) {
  const browserSetting = (KeyStore.getString(EXTERNAL_LINK_BROWSER_KEY) ??
    EXTERNAL_LINK_BROWSER_DEFAULT) as BrowserOption;

  const browserConfig = BROWSER_CONFIGS[browserSetting];

  if (browserSetting === "internalBrowser") {
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      dismissButtonStyle: "close",
      readerMode:
        KeyStore.getBoolean(OPEN_IN_READER_MODE_KEY) ??
        OPEN_IN_READER_MODE_DEFAULT,
      ...browserParams,
    });
    return;
  }

  const schemeURL = browserConfig.getURLScheme(url);
  try {
    await Linking.openURL(schemeURL);
  } catch (_error) {
    Alert.alert(
      `Error`,
      `Hydra was not able to open "${browserConfig.label}". You may not have this browser installed. You can change your link opening settings under Settings => General => External Links. \n\n${schemeURL}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // Do nothing
          },
        },
        {
          text: "Open in Default Browser",
          style: "default",
          onPress: () => {
            Linking.openURL(url);
          },
        },
      ],
    );
  }
}
