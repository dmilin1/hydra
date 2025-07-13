import { Feather } from "@expo/vector-icons";
import React, { useContext, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";

import { getCurrentUser } from "../../api/Authentication";
import { Account } from "../../api/User";
import { AccountContext } from "../../contexts/AccountContext";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { WebView } from "react-native-webview";

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
`;

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const { currentUser, addUser, logIn, logOut } = useContext(AccountContext);
  const { setModal } = useContext(ModalContext);

  const initialUser = useRef(currentUser);
  const loginFinished = useRef(false);

  const handleLoginSuccess = async (account: Account) => {
    await addUser(account);
  };

  const handleLoginCanceled = () => {
    if (initialUser.current) {
      logIn({ username: initialUser.current.userName });
    }
    setModal(null);
  };

  const handleLoginFailed = () => {
    if (initialUser.current !== currentUser) {
      logOut();
    }
    Alert.alert("Login failed", "Something went wrong");
  };

  const handleLoginFinished = async () => {
    if (loginFinished.current) return;
    loginFinished.current = true;
    setModal(null);
    const currentUser = await getCurrentUser();
    if (currentUser) {
      handleLoginSuccess({ username: currentUser.data.name });
    } else {
      handleLoginFailed();
    }
  };

  useEffect(() => {
    if (currentUser) {
      logOut();
    }
  }, []);

  return (
    <View style={styles.loginContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          <View style={styles.navbarTitleContainer}>
            <Text style={styles.navbarText}>Login</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleLoginCanceled()}
            style={styles.closeButton}
            hitSlop={15}
          >
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.webViewContainer}>
          {currentUser ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <WebView
              source={{
                uri: "https://www.reddit.com/login?dest=https://www.reddit.com/r/HydraApp",
              }}
              style={styles.webView}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              onLoadStart={(event) => {
                if (
                  !event.nativeEvent.url.includes("reddit.com/login") &&
                  !event.nativeEvent.url.includes(
                    "redditinc.com/policies/user-agreement",
                  ) &&
                  !event.nativeEvent.url.includes(
                    "redditinc.com/policies/privacy-policy",
                  ) &&
                  !event.nativeEvent.url.includes(
                    "reddit.com/policies/privacy-policy",
                  )
                ) {
                  handleLoginFinished();
                }
              }}
              injectedJavaScript={INJECTED_JAVASCRIPT}
              // Injected js doesn't run unless you pass a function here even if it doesn't do anything. No idea why.
              onMessage={() => {}}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    position: "absolute",
    top: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
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
});
