import {
  AntDesign,
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useContext } from "react";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../../utils/navigation";

export default function GeneralRoot() {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  return (
    <>
      <List
        title="General"
        items={[
          {
            key: "sorting",
            icon: <FontAwesome name="sort" size={24} color={theme.text} />,
            text: "Post & Comment Sorting",
            onPress: () => pushURL("hydra://settings/general/sorting"),
          },
          {
            key: "filters",
            icon: <AntDesign name="filter" size={24} color={theme.text} />,
            text: "Filters",
            onPress: () => pushURL("hydra://settings/general/filters"),
          },
          {
            key: "openInHydra",
            icon: <Feather name="external-link" size={24} color={theme.text} />,
            text: "Open in Hydra",
            onPress: () => pushURL("hydra://settings/general/openInHydra"),
          },
          {
            key: "startup",
            icon: (
              <MaterialCommunityIcons
                name="restart"
                size={24}
                color={theme.text}
              />
            ),
            text: "App Startup",
            onPress: () => pushURL("hydra://settings/general/startup"),
          },
          {
            key: "legal",
            icon: <Feather name="file-text" size={24} color={theme.text} />,
            text: "Legal",
            onPress: () => pushURL("hydra://settings/general/legal"),
          },
        ]}
      />
    </>
  );
}
