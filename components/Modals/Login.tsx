import Feather from "@react-native-vector-icons/feather";
import React, { useContext, useRef, useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Alert } from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountContext } from "../../contexts/AccountContext";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { WebView } from "react-native-webview";
import RedditCookies from "../../utils/RedditCookies";
import { USER_AGENT } from "../../api/UserAgent";

const INJECTED_JAVASCRIPT = `
  const modifyThroughShadowDOM = (selector, styleOrFunction) => {
    const applyInTree = (root) => {
      try {
        // Regular DOM
        root.querySelectorAll(selector).forEach(el => {
          if (typeof styleOrFunction === 'function') {
            styleOrFunction(el);
          } else if (typeof styleOrFunction === 'object') {
            Object.assign(el.style, styleOrFunction);
          }
        });
        
        // Shadow DOM
        root.querySelectorAll('*').forEach(el => {
          if (el.shadowRoot) {
            applyInTree(el.shadowRoot);
          }
        });
      } catch (e) {
        console.warn('Error applying styles to elements:', e);
      }
    };
    
    applyInTree(document);
    
    // Watch for changes
    new MutationObserver(() => applyInTree(document))
      .observe(document.body, { childList: true, subtree: true });
  };

  modifyThroughShadowDOM(
    '.flex.justify-between.items-end.pt-lg.pb-xs',
    { display: 'none' },
  );

  modifyThroughShadowDOM(
    'h1.text-24.text-center.text-neutral-content-strong',
    { 'margin-top': '20px' },
  );

  modifyThroughShadowDOM(
    'auth-flow-manager',
    { 'z-index': 1 },
  );
`;

/**
 * Sign in with Apple JS opens a popup and waits for it to postMessage back to
 * window.opener. WebView can't create real popups, so hand Apple JS a fake
 * window and show the URL in a second WebView whose messages get relayed here.
 */
const REDDIT_APPLE_POPUP_SHIM = `
  (() => {
    const post = (msg) => window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    const nativeOpen = window.open;
    let popup = null;
    window.open = function (url, ...rest) {
      if (typeof url === 'string' && url.startsWith('https://appleid.apple.com/')) {
        popup = {
          closed: false,
          close() {
            if (this.closed) return;
            this.closed = true;
            post({ type: 'appleClose' });
          },
        };
        post({ type: 'appleOpen', url });
        return popup;
      }
      return nativeOpen.call(window, url, ...rest);
    };
    window.__hydraApple = {
      message: (data) => window.dispatchEvent(
        new MessageEvent('message', { data, origin: 'https://appleid.apple.com' }),
      ),
      // Apple JS polls popup.closed to detect the user backing out.
      closed: () => { if (popup) popup.closed = true; },
    };
  })();
  true;
`;

const APPLE_OPENER_SHIM = `
  (() => {
    const post = (msg) => window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    Object.defineProperty(window, 'opener', {
      configurable: true,
      get: () => ({ closed: false, postMessage: (data) => post({ type: 'appleMessage', data }) }),
    });
    window.close = () => post({ type: 'appleClose' });
  })();
  true;
`;

const ALLOWED_URLS = [
  "reddit.com/login",
  "redditinc.com/policies/user-agreement",
  "redditinc.com/policies/privacy-policy",
  "reddit.com/policies/privacy-policy",
  "reddit.com/r/HydraClient",
];

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const { logIn, doWithTempLogout } = useContext(AccountContext);
  const { setModal } = useContext(ModalContext);
  const [canShow, setCanShow] = useState(false);
  const [appleUrl, setAppleUrl] = useState<string | null>(null);

  const loginFinished = useRef(false);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const redditWebView = useRef<WebView<object>>(null);

  const closeApplePopup = () => {
    setAppleUrl(null);
    redditWebView.current?.injectJavaScript(
      "window.__hydraApple?.closed(); true;",
    );
  };

  const handleLoginCanceled = () => {
    resolver.current?.(true);
    setModal(null);
  };

  const handleLoginFailed = () => {
    resolver.current?.(true);
    Alert.alert("Login failed", "Something went wrong");
  };

  const handleLoginFinished = async () => {
    if (loginFinished.current) return;
    loginFinished.current = true;
    setModal(null);
    const loginSuccess = await logIn();
    // null: the user picked another account meanwhile, so don't restore one.
    if (loginSuccess === false) {
      handleLoginFailed();
    } else {
      resolver.current?.(false);
    }
  };

  useEffect(() => {
    const promise = new Promise<boolean>(
      (resolve) => (resolver.current = resolve),
    );
    doWithTempLogout(() => {
      setCanShow(true);
      return promise;
    });
  }, []);

  useEffect(() => {
    /**
     * Backup method using polling to check if the session cookie has been set.
     * This is necessary because the onLoadStart event isn't triggering for all
     * users. I've been unable to reproduce the issue and it may be because Reddit
     * is running an experiment.
     */
    if (!canShow) return;
    const interval = setInterval(async () => {
      if (await RedditCookies.hasSessionCookieBeenSet()) {
        handleLoginFinished();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [canShow]);

  return (
    <View style={styles.loginContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          <View style={styles.navbarTitleContainer}>
            <Text style={styles.navbarText}>
              {appleUrl ? "Sign in with Apple" : "Login"}
            </Text>
          </View>
          <Touchable
            activeOpacity={0.2}
            animationDuration={{ in: 0, out: 150 }}
            onPress={() =>
              appleUrl ? closeApplePopup() : handleLoginCanceled()
            }
            style={styles.closeButton}
            hitSlop={15}
          >
            <Feather name="x" size={24} color="white" />
          </Touchable>
        </View>
        <View style={styles.webViewContainer}>
          {!canShow ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <WebView
              ref={redditWebView}
              source={{
                uri: "https://www.reddit.com/login?dest=https://www.reddit.com/r/HydraClient",
              }}
              style={styles.webView}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              onLoadStart={(event) => {
                if (
                  !ALLOWED_URLS.some((url) =>
                    event.nativeEvent.url.includes(url),
                  )
                ) {
                  handleLoginFinished();
                }
              }}
              userAgent={USER_AGENT}
              injectedJavaScript={INJECTED_JAVASCRIPT}
              injectedJavaScriptBeforeContentLoaded={REDDIT_APPLE_POPUP_SHIM}
              // Injected js doesn't run unless you pass a function here.
              onMessage={(event) => {
                const message = JSON.parse(event.nativeEvent.data);
                if (message.type === "appleOpen") setAppleUrl(message.url);
                if (message.type === "appleClose") closeApplePopup();
              }}
            />
          )}
          {appleUrl ? (
            <WebView
              source={{ uri: appleUrl }}
              // style only reaches the inner native view; the wrapper is flex: 1.
              containerStyle={styles.applePopup}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              userAgent={USER_AGENT}
              injectedJavaScriptBeforeContentLoaded={APPLE_OPENER_SHIM}
              onMessage={(event) => {
                const message = JSON.parse(event.nativeEvent.data);
                if (message.type === "appleMessage") {
                  redditWebView.current?.injectJavaScript(
                    `window.__hydraApple?.message(${JSON.stringify(message.data)}); true;`,
                  );
                }
                if (message.type === "appleClose") closeApplePopup();
              }}
            />
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "black",
  },
  safeArea: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "relative",
    justifyContent: "flex-end",
    minHeight: 44,
  },
  navbarTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
  },
  navbarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  closeButton: {
    zIndex: 1,
    marginLeft: "auto",
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  applePopup: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
