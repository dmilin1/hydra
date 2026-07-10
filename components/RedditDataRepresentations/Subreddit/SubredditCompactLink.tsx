import { FontAwesome } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";

import { Subreddit } from "../../../api/Subreddits";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../../../contexts/SubredditContext";
import { useURLNavigation } from "../../../utils/navigation";
import { Touchable } from "react-native-gesture-handler";

export default function SubredditCompactLink({
  subreddit,
}: {
  subreddit: Subreddit;
}) {
  const { subreddits, toggleFavorite } = useContext(SubredditContext);

  const { pushURL } = useURLNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <Touchable
      onPress={() => pushURL(subreddit.url)}
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
            recyclingKey={subreddit.iconURL}
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
          <Touchable
            onPress={() => toggleFavorite(subreddit.name)}
            activeOpacity={0.2}
            animationDuration={{ in: 0, out: 150 }}
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
          </Touchable>
        </View>
      </>
    </Touchable>
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
    marginRight: 25,
  },
  favoriteIcon: {
    fontSize: 22,
  },
});
