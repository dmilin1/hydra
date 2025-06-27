import { Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import * as WebBrowser from "expo-web-browser";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";

export default function Legal() {
  const { theme } = useContext(ThemeContext);

  return (
    <List
      title="Legal"
      items={[
        {
          key: "privacyPolicy",
          icon: <Feather name="shield" size={24} color={theme.text} />,
          text: "Privacy Policy",
          onPress: () => {
            WebBrowser.openBrowserAsync("https://www.hydraapp.io/privacy");
          },
        },
        {
          key: "eula",
          icon: <Feather name="file-text" size={24} color={theme.text} />,
          text: "End User License Agreement",
          onPress: () => {
            WebBrowser.openBrowserAsync(
              "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
            );
          },
        },
      ]}
    />
  );
}
