import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import { Subreddit } from "../../../api/Subreddits";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import Numbers from "../../../utils/Numbers";
import { useURLNavigation } from "../../../utils/navigation";

export default function SubredditComponent({
  subreddit,
}: {
  subreddit: Subreddit;
}) {
  const { pushURL } = useURLNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.subredditContainer,
          {
            backgroundColor: theme.background,
          },
        ]}
        onPress={() => {
          pushURL(subreddit.url);
        }}
      >
        <Text
          style={[
            styles.subredditTitle,
            {
              color: theme.text,
            },
          ]}
        >
          /r/{subreddit.name}
        </Text>
        <View style={styles.subredditBody}>
          <View style={styles.bodyTextContainer}>
            <Text
              numberOfLines={3}
              style={[
                styles.bodyText,
                {
                  color: theme.subtleText,
                },
              ]}
            >
              {subreddit.description ? subreddit.description : "No description"}
            </Text>
          </View>
        </View>
        <View style={styles.subredditFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.metadataContainer}>
              <Ionicons
                name="person-outline"
                size={18}
                color={theme.subtleText}
              />
              <Text
                style={[
                  styles.metadataText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {new Numbers(subreddit.subscribers).prettyNum()}
              </Text>
              <FontAwesome name="feed" size={18} color={theme.subtleText} />
              <Text
                style={[
                  styles.metadataText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {subreddit.subscribed ? "Joined" : "Not Subscribed"}
              </Text>
              <Feather name="clock" size={18} color={theme.subtleText} />
              <Text
                style={[
                  styles.metadataText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {subreddit.timeSinceCreation}
              </Text>
            </View>
          </View>
          <View style={styles.footerRight} />
        </View>
      </TouchableOpacity>
      <View
        style={[
          styles.spacer,
          {
            backgroundColor: theme.divider,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  subredditContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  subredditTitle: {
    fontSize: 17,
    paddingHorizontal: 10,
  },
  subredditBody: {
    flex: 1,
    marginVertical: 5,
  },
  bodyTextContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  bodyText: {
    fontSize: 15,
  },
  subredditFooter: {
    marginHorizontal: 10,
  },
  metadataContainer: {
    flexDirection: "row",
    marginTop: 7,
    alignItems: "center",
  },
  metadataText: {
    fontSize: 14,
    marginLeft: 3,
    marginRight: 12,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
  },
  spacer: {
    height: 10,
  },
});
