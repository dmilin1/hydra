import { Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import { useMMKVString } from "react-native-mmkv";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import {
  BROWSER_CONFIGS,
  BrowserOption,
  EXTERNAL_LINK_BROWSER_DEFAULT,
  EXTERNAL_LINK_BROWSER_KEY,
} from "../../../utils/openExternalLink";
import { useSettingsPicker } from "../../../utils/useSettingsPicker";

export default function ExternalLinks() {
  const { theme } = useContext(ThemeContext);

  const [storedBrowser, setBrowser] = useMMKVString(EXTERNAL_LINK_BROWSER_KEY);
  const selectedBrowser =
    (storedBrowser as BrowserOption) ?? EXTERNAL_LINK_BROWSER_DEFAULT;

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
      ]}
    />
  );
}
