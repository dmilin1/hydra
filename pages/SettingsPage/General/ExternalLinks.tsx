import Feather from "@react-native-vector-icons/feather";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import React, { useContext } from "react";
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
import { useSettingsPicker } from "../../../utils/useSettingsPicker";
import { Platform, Switch } from "react-native";
import { useURLNavigation } from "../../../utils/navigation";

export default function ExternalLinks() {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  const [storedBrowser, setBrowser] = useMMKVString(EXTERNAL_LINK_BROWSER_KEY);
  const selectedBrowser =
    (storedBrowser as BrowserOption) ?? EXTERNAL_LINK_BROWSER_DEFAULT;

  const [storedOpenInReaderMode, setOpenInReaderMode] = useMMKVBoolean(
    OPEN_IN_READER_MODE_KEY,
  );
  const openInReaderMode =
    storedOpenInReaderMode ?? OPEN_IN_READER_MODE_DEFAULT;

  const { openPicker, rightIcon } = useSettingsPicker({
    items: Object.values(BROWSER_CONFIGS),
    value: selectedBrowser,
    onChange: setBrowser,
  });

  return (
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
        ...(selectedBrowser === "internalBrowser" &&
        (Platform.OS === "ios" || Platform.OS === "macos")
          ? [
              {
                key: "readerMode",
                icon: <Feather name="book-open" size={24} color={theme.text} />,
                text: "Open in reader mode",
                rightIcon: (
                  <Switch
                    value={openInReaderMode}
                    onValueChange={() => setOpenInReaderMode(!openInReaderMode)}
                  />
                ),
                onPress: () => setOpenInReaderMode(!openInReaderMode),
              },
            ]
          : []),
        {
          key: "modifyLinks",
          icon: (
            <MaterialDesignIcons
              name="link-edit"
              size={26}
              color={theme.text}
            />
          ),
          text: "Modify Links",
          onPress: () => pushURL("hydra://settings/general/modifyLinks"),
        },
      ]}
    />
  );
}
