import {
  AntDesign,
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useContext } from "react";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import { useURLNavigation } from "../../../utils/navigation";

export default function GeneralRoot() {
  const { theme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);
  const { pushURL } = useURLNavigation();

  const generalItems = [
    {
      key: "gestures",
      icon: <FontAwesome name="hand-o-up" size={24} color={theme.text} />,
      text: "Gestures",
      onPress: () => pushURL("hydra://settings/general/gestures"),
    },
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
    {
      key: "externalLinks",
      icon: <Feather name="link" size={22} color={theme.text} />,
      text: "External Links",
      onPress: () => pushURL("hydra://settings/general/externalLinks"),
    },
  ];

  if (isPro) {
    generalItems.splice(5, 0, {
      key: "translations",
      icon: <MaterialCommunityIcons name="translate" size={24} color={theme.text} />,
      text: "Translations",
      onPress: () => pushURL("hydra://settings/general/translations"),
    });
  }

  return (
    <>
      <List
        title="General"
        items={generalItems}
      />
    </>
  );
}
