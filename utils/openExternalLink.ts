import * as WebBrowser from "expo-web-browser";

const defaultBrowserParams: WebBrowser.WebBrowserOpenOptions = {
  presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
  dismissButtonStyle: "close",
};

export async function openExternalLink(
  url: string,
  browserParams?: WebBrowser.WebBrowserOpenOptions,
): Promise<WebBrowser.WebBrowserResult> {
  const mergedParams = {
    ...defaultBrowserParams,
    ...browserParams,
  };

  return WebBrowser.openBrowserAsync(url, mergedParams);
}
