import { WebView } from "react-native-webview";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useContext } from "react";
import RedditURL, { PageType } from "../../utils/RedditURL";
import { useURLNavigation } from "../../utils/navigation";
import { openExternalLink } from "../../utils/openExternalLink";
import URL from "../../utils/URL";

export default function ThemedWebView({ url }: { url: string }) {
  const { theme } = useContext(ThemeContext);

  const { pushURL } = useURLNavigation();

  const bg = String(theme.background);
  const tint = String(theme.tint);
  const text = String(theme.text);
  const subtleText = String(theme.subtleText);
  const link = String(theme.iconOrTextButton);
  const divider = String(theme.divider);

  const injectedCSS = `
(function() {
    var style = document.createElement('style');
    style.innerHTML = \`
        /* Base */
        body, html {
            background-color: ${bg} !important;
            color: ${text} !important;
        }
        a, a:visited {
            color: ${link} !important;
        }
        /* Old Reddit */
        #header, #header-bottom-left, .pagename a, #header .tabmenu li a {
            background-color: ${tint} !important;
            color: ${text} !important;
            border-color: ${divider} !important;
        }
        .content, #siteTable, .side, .sidebar, .usertext-body,
        .md, .rounded, .thing, .entry, .self, .link {
            background-color: ${bg} !important;
            color: ${text} !important;
            border-color: ${divider} !important;
        }
        .tagline, .author, time, .score, .usertext, .morecomments a {
            color: ${subtleText} !important;
        }
        .comment, .commentarea {
            background-color: ${bg} !important;
        }
        /* New Reddit (shreddit) */
        shreddit-app, faceplate-app, reddit-header-large,
        [slot="content"], shreddit-post, shreddit-comment {
            background-color: ${bg} !important;
            color: ${text} !important;
        }
        reddit-header-large {
            background-color: ${tint} !important;
        }
        shreddit-post, shreddit-comment, .thing {
            border-color: ${divider} !important;
        }
        /* Generic dark-mode-safe overrides */
        [class*="bg-white"], [class*="bg-neutral-background"] {
            background-color: ${bg} !important;
        }
        [class*="bg-neutral-background-weak"],
        [class*="bg-secondary"] {
            background-color: ${tint} !important;
        }
        [class*="text-secondary"], [class*="text-neutral-content-weak"] {
            color: ${subtleText} !important;
        }
        hr, [class*="divider"], [class*="Divider"], [class*="separator"] {
            border-color: ${divider} !important;
            background-color: ${divider} !important;
        }
        .info-box {
            background-color: ${tint} !important;
            color: ${text} !important;
            border-color: ${divider} !important;
        }
        .bg-neutral-background-container-strong {
            background-color: ${tint} !important;
        }
        header {
            display: none !important;
        }
        shreddit-app {
            padding-top: 0 !important;
        }
        .main-container {
            background-color: ${bg} !important;
        }
        .wiki-content {
            background-color: ${bg} !important;
        }
        #xpromo-bottom-sheet {
            display: none !important;
        }
    \`;
    document.head.appendChild(style);
})();
`;

  return (
    <WebView
      source={{
        uri: url,
      }}
      sharedCookiesEnabled={true}
      thirdPartyCookiesEnabled={true}
      injectedJavaScript={injectedCSS}
      style={{ backgroundColor: theme.background }}
      // Injected js doesn't run unless you pass a function here even if it doesn't do anything. No idea why.
      onMessage={() => {}}
      webviewDebuggingEnabled={true}
      onShouldStartLoadWithRequest={(e) => {
        if (!e.isTopFrame) return true;
        let currentURL = new URL(e.url).getBasePath().toString();
        let targetURL = new URL(url).getBasePath().toString();
        if (!currentURL.endsWith("/")) {
          currentURL += "/";
        }
        if (!targetURL.endsWith("/")) {
          targetURL += "/";
        }
        if (currentURL === targetURL) return true;
        try {
          const redditURL = new RedditURL(e.url);
          if (redditURL.getPageType() === PageType.UNKNOWN) {
            throw Error("Unknown page type");
          } else {
            pushURL(e.url);
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
  );
}

const styles = StyleSheet.create({
  webview: {
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
