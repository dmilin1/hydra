import { Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, Switch, Text } from "react-native";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import {
  BROWSER_CONFIGS,
  BrowserOption,
  EXTERNAL_LINK_BROWSER_DEFAULT,
  EXTERNAL_LINK_BROWSER_KEY,
  OPEN_IN_READER_MODE_DEFAULT,
  OPEN_IN_READER_MODE_KEY,
} from "../../../utils/openExternalLink";
import {
  SHARE_OLD_REDDIT_LINKS_DEFAULT,
  SHARE_OLD_REDDIT_LINKS_KEY,
} from "../../../utils/shareURL";
import { useSettingsPicker } from "../../../utils/useSettingsPicker";

export default function ExternalLinks() {
  const { theme } = useContext(ThemeContext);

  const [storedBrowser, setBrowser] = useMMKVString(EXTERNAL_LINK_BROWSER_KEY);
  const selectedBrowser =
    (storedBrowser as BrowserOption) ?? EXTERNAL_LINK_BROWSER_DEFAULT;

  const [storedOpenInReaderMode, setOpenInReaderMode] = useMMKVBoolean(
    OPEN_IN_READER_MODE_KEY,
  );
  const openInReaderMode =
    storedOpenInReaderMode ?? OPEN_IN_READER_MODE_DEFAULT;

  const [storedShareOldRedditLinks, setShareOldRedditLinks] = useMMKVBoolean(
    SHARE_OLD_REDDIT_LINKS_KEY,
  );
  const shareOldRedditLinks =
    storedShareOldRedditLinks ?? SHARE_OLD_REDDIT_LINKS_DEFAULT;

  const { openPicker, rightIcon } = useSettingsPicker({
    items: Object.values(BROWSER_CONFIGS),
    value: selectedBrowser,
    onChange: setBrowser,
  });

  return (
    <>
      <List
        title="External Links"
        items={[
          {
            key: "browser",
            icon: <Feather name="external-link" size={24} color={theme.text} />,
            text: "Open links with",
            rightIcon: rightIcon,
            onPress: () => openPicker(),
          },
          {
            key: "shareOldRedditLinks",
            icon: <Feather name="share" size={24} color={theme.text} />,
            text: "Share reddit links as old.reddit.com",
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={shareOldRedditLinks}
                onValueChange={() =>
                  setShareOldRedditLinks(!shareOldRedditLinks)
                }
              />
            ),
            onPress: () => setShareOldRedditLinks(!shareOldRedditLinks),
          },
          ...(selectedBrowser === "internalBrowser"
            ? [
                {
                  key: "readerMode",
                  icon: (
                    <Feather name="book-open" size={24} color={theme.text} />
                  ),
                  text: "Open in reader mode",
                  rightIcon: (
                    <Switch
                      trackColor={{
                        false: theme.iconSecondary,
                        true: theme.iconPrimary,
                      }}
                      value={openInReaderMode}
                      onValueChange={() =>
                        setOpenInReaderMode(!openInReaderMode)
                      }
                    />
                  ),
                  onPress: () => setOpenInReaderMode(!openInReaderMode),
                },
              ]
            : []),
        ]}
      />
      <Text
        style={[
          styles.description,
          {
            color: theme.text,
          },
        ]}
      >
        When enabled, shared Reddit post and comment links use old.reddit.com
        instead of the standard Reddit domain.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  description: {
    marginHorizontal: 15,
    marginTop: 15,
    lineHeight: 20,
  },
});
