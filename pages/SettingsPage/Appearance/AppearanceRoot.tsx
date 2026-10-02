import Feather from "@react-native-vector-icons/feather";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import React, { useContext } from "react";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../../utils/navigation";

export default function AppearanceRoot() {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  return (
    <List
      title="Appearance"
      items={[
        {
          key: "posts",
          icon: <Feather name="file-text" size={22} color={theme.text} />,
          text: "Posts",
          onPress: () => pushURL("hydra://settings/appearance/posts"),
        },
        {
          key: "comments",
          icon: <Feather name="message-square" size={22} color={theme.text} />,
          text: "Comments",
          onPress: () => pushURL("hydra://settings/appearance/comments"),
        },
        {
          key: "tabs",
          icon: (
            <MaterialCommunityIcons
              name="dock-bottom"
              size={24}
              color={theme.text}
            />
          ),
          text: "Tabs",
          onPress: () => pushURL("hydra://settings/appearance/tabs"),
        },
        {
          key: "subreddits",
          icon: <Feather name="list" size={22} color={theme.text} />,
          text: "Subreddits Page",
          onPress: () => pushURL("hydra://settings/appearance/subreddits"),
        },
      ]}
    />
  );
}
