import { FontAwesome } from "@expo/vector-icons";
import { useContext } from "react";
import { StyleSheet, View, Image } from "react-native";

import { PostDetail } from "../../../../api/PostDetail";
import { Post } from "../../../../api/Posts";
import { DataModeContext } from "../../../../contexts/SettingsContexts/DataModeContext";
import { PostSettingsContext } from "../../../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";

type SubredditIconProps = {
  post: Post | PostDetail;
};

export default function SubredditIcon({ post }: SubredditIconProps) {
  const { theme } = useContext(ThemeContext);
  const { currentDataMode } = useContext(DataModeContext);
  const { showSubredditIcon } = useContext(PostSettingsContext);

  return showSubredditIcon && currentDataMode !== "lowData" ? (
    <View style={styles.container}>
      {post.subredditIcon ? (
        <Image src={post.subredditIcon} style={styles.image} />
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
