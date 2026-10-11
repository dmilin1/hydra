import React, { useContext } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { URLRoutes } from "../app/stack";
import { useRoute, useURLNavigation } from "../utils/navigation";
import RedditURL, { PageType } from "../utils/RedditURL";
import WebView from "react-native-webview";
import { openExternalLink } from "../utils/openExternalLink";

export default function ChatPage() {
  const { params } = useRoute<URLRoutes>();
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  return (
    <View
      style={[
        styles.chatContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <WebView
        source={{
          uri: params.url,
        }}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        style={{ backgroundColor: theme.background }}
        onShouldStartLoadWithRequest={(e) => {
          if (!e.isTopFrame) return true;
          try {
            const redditURL = new RedditURL(e.url);
            const pageType = redditURL.getPageType();
            if (pageType === PageType.UNKNOWN) {
              throw Error("Unknown page type");
            } else if (pageType === PageType.CHAT) {
              return true;
            } else {
              pushURL(redditURL.toString());
            }
            return false;
          } catch {
            openExternalLink(e.url);
            return false;
          }
        }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.text} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
