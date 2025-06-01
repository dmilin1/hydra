import { FontAwesome } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";

import { Subreddit } from "../../../api/Subreddits";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../../../contexts/SubredditContext";
import { useURLNavigation } from "../../../utils/navigation";

export default function SubredditCompactLink({
  subreddit,
}: {
  subreddit: Subreddit;
}) {
  const { subreddits, toggleFavorite } = useContext(SubredditContext);

  const { pushURL } = useURLNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      key={subreddit.name}
      onPress={() => pushURL(subreddit.url)}
      activeOpacity={0.5}
      style={[
        styles.subredditContainer,
        {
          borderBottomColor: theme.tint,
        },
      ]}
    >
      <>
        {subreddit.iconURL ? (
          <Image
            source={{ uri: subreddit.iconURL }}
            style={styles.subredditIcon}
          />
        ) : (
          <FontAwesome name="reddit" size={30} color={theme.text} />
        )}
        <Text
          style={[
            styles.subredditText,
            {
              color: theme.text,
            },
          ]}
        >
          {subreddit.name}
        </Text>
        <View style={styles.favoriteIconContainer}>
          <TouchableOpacity
            onPress={() => toggleFavorite(subreddit.name)}
            hitSlop={10}
          >
            <FontAwesome
              name={
                subreddits["favorites"].find(
                  (sub) => sub.name === subreddit.name,
                )
                  ? "star"
                  : "star-o"
              }
              color={
                subreddits["favorites"].find(
                  (sub) => sub.name === subreddit.name,
                )
                  ? theme.text
                  : theme.subtleText
              }
              style={styles.favoriteIcon}
            />
          </TouchableOpacity>
        </View>
      </>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  subredditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  subredditIcon: {
    width: 30,
    height: 30,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  subredditText: {
    fontSize: 16,
  },
  favoriteIconContainer: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 10,
  },
  favoriteIcon: {
    fontSize: 22,
  },
});
