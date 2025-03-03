import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useContext } from "react";
import { Switch, Text, StyleSheet } from "react-native";
import { useMMKVBoolean } from "react-native-mmkv";

import List from "../../../components/UI/List";
import {
  t,
  ThemeContext,
} from "../../../contexts/SettingsContexts/ThemeContext";

export const READ_CLIPBOARD_KEY = "readClipboard";
export const READ_CLIPBOARD_DEFAULT = false;

export default function OpenInHydra() {
  const { theme } = useContext(ThemeContext);

  const [storedReadClipboard, setReadClipboard] =
    useMMKVBoolean(READ_CLIPBOARD_KEY);

  const readClipboard = storedReadClipboard ?? READ_CLIPBOARD_DEFAULT;

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
        style={t(styles.textDescription, {
          color: theme.text,
        })}
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
        style={t(styles.textDescription, {
          color: theme.text,
        })}
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
