import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import React, { useContext } from "react";
import { Alert, Platform, Switch, Text, StyleSheet } from "react-native";
import { useMMKVBoolean } from "react-native-mmkv";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import extractRedditURL from "../../../utils/extractRedditURL";
import RedditURL from "../../../utils/RedditURL";
import { useURLNavigation } from "../../../utils/navigation";

export const READ_CLIPBOARD_KEY = "readClipboard";
export const READ_CLIPBOARD_DEFAULT = false;

export default function OpenInHydra() {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  const [storedReadClipboard, setReadClipboard] =
    useMMKVBoolean(READ_CLIPBOARD_KEY);

  const readClipboard = storedReadClipboard ?? READ_CLIPBOARD_DEFAULT;

  const openClipboardURL = async () => {
    const clipboardText = await Clipboard.getStringAsync();
    const clipboardURL = extractRedditURL(clipboardText);

    if (!clipboardURL) {
      Alert.alert(
        "No Reddit URL found",
        "Your clipboard does not currently contain a Reddit link Hydra can open.",
      );
      return;
    }

    try {
      const redditURL = new RedditURL(clipboardURL);
      pushURL(redditURL.toString());
    } catch (_e) {
      Alert.alert(
        "No Reddit URL found",
        "Your clipboard does not currently contain a Reddit link Hydra can open.",
      );
    }
  };

  if (Platform.OS === "android") {
    return (
      <>
        <Text
          style={[
            styles.textDescription,
            {
              color: theme.text,
            },
          ]}
        >
          On Android, the reliable local flows are the system share sheet and
          clipboard detection. In any app, tap Share and choose Hydra to open a
          Reddit link directly.
        </Text>
        <List
          title="Clipboard Links"
          items={[
            {
              key: "openClipboardLink",
              icon: <Feather name="link" size={24} color={theme.text} />,
              text: "Open Reddit Link from Clipboard",
              onPress: () => openClipboardURL(),
            },
            {
              key: "readClipboard",
              icon: <Feather name="clipboard" size={24} color={theme.text} />,
              rightIcon: (
                <Switch
                  trackColor={{
                    false: theme.iconSecondary,
                    true: theme.iconPrimary,
                  }}
                  value={readClipboard}
                  onValueChange={() => setReadClipboard(!readClipboard)}
                />
              ),
              text: "Suggest Clipboard Reddit Links",
              onPress: () => setReadClipboard(!readClipboard),
            },
          ]}
        />
        <Text
          style={[
            styles.textDescription,
            {
              color: theme.text,
            },
          ]}
        >
          Hydra can watch for Reddit links on your clipboard and offer to open
          them when the app becomes active.
        </Text>
      </>
    );
  }

  return (
    <>
      <List
        title="Hydra Shortcut"
        items={[
          {
            key: "hydraShortcut",
            icon: (
              <MaterialIcons name="app-shortcut" size={24} color={theme.text} />
            ),
            text: "Get Hydra Shortcut",
            onPress: () =>
              Linking.openURL(
                "https://www.icloud.com/shortcuts/f509e3f85f174526b6cabdc48e96b11c",
              ),
          },
        ]}
      />
      <Text
        style={[
          styles.textDescription,
          {
            color: theme.text,
          },
        ]}
      >
        Setting up this shortcut will add an "Open in Hydra" option to the
        bottom of the share sheet in other apps. This will allow you to open
        Reddit links directly into Hydra.
      </Text>
      <List
        title="Clipboard Links"
        items={[
          {
            key: "filterSeenPosts",
            icon: <Feather name="clipboard" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={readClipboard}
                onValueChange={() => setReadClipboard(!readClipboard)}
              />
            ),
            text: "Read Links from Clipboard",
            onPress: () => setReadClipboard(!readClipboard),
          },
        ]}
      />
      <Text
        style={[
          styles.textDescription,
          {
            color: theme.text,
          },
        ]}
      >
        Hydra can automatically detect Reddit links from your clipboard and
        prompt you to open them.
        {"\n\n"}
        Enabling this will cause iOS to ask you each time if you want to allow
        Hydra to read your clipboard. To disable the duplicate prompt, you can
        go to Hydra in the iOS Settings app and change "Paste from Other Apps"
        to "Allow".
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  textDescription: {
    margin: 15,
    lineHeight: 20,
  },
});
