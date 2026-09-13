import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@react-native-vector-icons/feather";
import WebView from "react-native-webview";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { readerScript } from "../../utils/readerScript";

type BrowserRequest = { url: string; reader: boolean };

let present: ((request: BrowserRequest) => void) | undefined;

export function openInternalBrowser(url: string, reader: boolean) {
  present?.({ url, reader });
}

export default function InternalBrowser() {
  const { theme } = useContext(ThemeContext);
  const [request, setRequest] = useState<BrowserRequest | null>(null);
  const [reader, setReader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [address, setAddress] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const web = useRef<WebView>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    present = (next) => {
      setReader(next.reader);
      setLoading(true);
      setNotice(null);
      setCanGoBack(false);
      setAddress(next.url);
      setCopied(false);
      setRequest(next);
    };
    return () => {
      present = undefined;
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const close = () => setRequest(null);

  const copyAddress = async () => {
    await Clipboard.setStringAsync(address);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  };

  const openInDefaultBrowser = async () => {
    try {
      await Linking.openURL(address);
    } catch (_e) {
      return;
    }
    close();
  };

  const script = readerScript(
    reader,
    String(theme.background),
    String(theme.text),
  );
  useEffect(() => {
    if (!loading) web.current?.injectJavaScript(script);
  }, [script, loading]);

  const button = (
    icon: React.ComponentProps<typeof Feather>["name"],
    label: string,
    action: () => void,
    disabled = false,
    selected?: boolean,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        disabled,
        ...(selected === undefined ? {} : { selected }),
      }}
      disabled={disabled}
      onPress={action}
      style={[
        styles.button,
        {
          opacity: disabled ? 0.35 : 1,
          backgroundColor: selected ? theme.tint : "transparent",
        },
      ]}
    >
      <Feather name={icon} size={23} color={theme.iconOrTextButton} />
    </Pressable>
  );

  return (
    <Modal
      visible={!!request}
      animationType="slide"
      onRequestClose={() => (canGoBack ? web.current?.goBack() : close())}
    >
      <SafeAreaView
        style={[styles.root, { backgroundColor: theme.background }]}
      >
        <View style={[styles.toolbar, { borderColor: theme.divider }]}>
          {button("x", "Close browser", close)}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy link"
            onPress={copyAddress}
            style={styles.address}
          >
            <Text
              numberOfLines={1}
              style={{ color: copied ? theme.iconOrTextButton : theme.text }}
            >
              {copied ? "Copied link" : address}
            </Text>
          </Pressable>
          {button(
            "external-link",
            "Open in default browser",
            openInDefaultBrowser,
          )}
        </View>
        {notice && (
          <Text
            accessibilityRole="alert"
            style={{ color: theme.text, padding: 12 }}
          >
            {notice}
          </Text>
        )}
        {loading && <ActivityIndicator color={theme.text} />}
        {request && (
          <WebView
            key={request.url}
            ref={web}
            source={{ uri: request.url }}
            style={{ flex: 1, backgroundColor: theme.background }}
            allowsFullscreenVideo
            onLoadStart={() => {
              setLoading(true);
              setNotice(null);
            }}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setNotice(
                "This page could not be loaded. Use Reload to try again.",
              );
            }}
            onNavigationStateChange={(state) => {
              setAddress(state.url);
              setCanGoBack(state.canGoBack);
            }}
            onMessage={(event) => {
              if (event.nativeEvent.data === "hydra-reader-unavailable") {
                setReader(false);
                setNotice("Reader mode is unavailable for this page.");
              }
            }}
          />
        )}
        <View style={[styles.toolbar, { borderColor: theme.divider }]}>
          {button(
            "arrow-left",
            "Go back",
            () => web.current?.goBack(),
            !canGoBack,
          )}
          {button("refresh-cw", "Reload page", () => web.current?.reload())}
          <View style={styles.spacer} />
          {button(
            "book-open",
            reader ? "Disable reader mode" : "Enable reader mode",
            () => {
              setNotice(null);
              setReader(!reader);
            },
            loading,
            reader,
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  address: { flex: 1, paddingVertical: 12 },
  spacer: { flex: 1 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  button: {
    padding: 12,
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
});
