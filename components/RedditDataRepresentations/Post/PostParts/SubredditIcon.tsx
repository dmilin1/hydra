import { FontAwesome } from "@expo/vector-icons";
import { useContext } from "react";
import { StyleSheet, View, Image } from "react-native";

import { DataModeContext } from "../../../../contexts/SettingsContexts/DataModeContext";
import { PostSettingsContext } from "../../../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";

type SubredditIconProps = {
  subredditIcon?: string;
  overridePostAppearanceSetting?: boolean;
};

export default function SubredditIcon({
  subredditIcon,
  overridePostAppearanceSetting,
}: SubredditIconProps) {
  const { theme } = useContext(ThemeContext);
  const { currentDataMode } = useContext(DataModeContext);
  const { showSubredditIcon } = useContext(PostSettingsContext);

  return (showSubredditIcon && currentDataMode !== "lowData") ||
    overridePostAppearanceSetting ? (
    <View style={styles.container}>
      {subredditIcon ? (
        <Image src={subredditIcon} style={styles.image} />
      ) : (
        <FontAwesome name="reddit" size={20} color={theme.text} />
      )}
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
