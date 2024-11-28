import { FontAwesome5, Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import MultiredditLink from "../components/RedditDataRepresentations/Multireddit/MultiredditLink";
import SubredditCompactLink from "../components/RedditDataRepresentations/Subreddit/SubredditCompactLink";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../contexts/SubredditContext";
import { useURLNavigation } from "../utils/navigation";

function SectionHeading({ title }: { title: string }) {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={t(styles.categoryTitleContainer, {
        backgroundColor: theme.tint,
      })}
    >
      <Text
        style={t(styles.categoryTitle, {
          color: theme.subtleText,
        })}
      >
        {title.toUpperCase()}
      </Text>
    </View>
  );
}

export default function Subreddits() {
  const { theme } = useContext(ThemeContext);
  const { subreddits, multis } = useContext(SubredditContext);

  const { pushURL } = useURLNavigation();

  return (
    <View style={styles.subredditsContainer}>
      <ScrollView
        style={t(styles.scrollView, {
          backgroundColor: theme.background,
        })}
      >
        {[
          {
            title: "Home",
            path: "https://www.reddit.com/",
            description: "Posts from subscriptions",
            icon: <FontAwesome5 name="home" size={24} color={theme.text} />,
            color: "#fa045e",
          },
          {
            title: "Popular",
            path: "https://www.reddit.com/r/popular",
            description: "Most popular posts across Reddit",
            icon: <Feather name="trending-up" size={24} color={theme.text} />,
            color: "#008ffe",
          },
          {
            title: "All",
            path: "https://www.reddit.com/r/all",
            description: "Posts across all subreddits",
            icon: (
              <FontAwesome5
                name="sort-amount-up-alt"
                size={24}
                color={theme.text}
              />
            ),
            color: "#02d82b",
          },
        ].map((link) => (
          <TouchableOpacity
            key={link.title}
            onPress={() => pushURL(link.path)}
            activeOpacity={0.5}
            style={t(styles.bigButtonContainer, {
              borderBottomColor: theme.tint,
            })}
          >
            <View
              key={link.path}
              style={t(styles.bigButtonSubContainer, {
                borderBottomColor: theme.tint,
              })}
            >
              <View
                style={t(styles.bigButtonIconContainer, {
                  backgroundColor: link.color,
                })}
              >
                {link.icon}
              </View>
              <View>
                <Text
                  style={t(styles.subredditText, {
                    color: theme.text,
                  })}
                >
                  {link.title}
                </Text>
                <Text
                  style={t(styles.subredditDescription, {
                    color: theme.subtleText,
                  })}
                >
                  {link.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {subreddits["favorites"].length > 0 && (
          <>
            <SectionHeading title="favorites" />
            {subreddits["favorites"].map((sub) => (
              <SubredditCompactLink key={sub.name} subreddit={sub} />
            ))}
          </>
        )}
        {multis.length > 0 && (
          <>
            <SectionHeading title="multireddits" />
            {multis.map((multi) => (
              <MultiredditLink key={multi.name} multi={multi} />
            ))}
          </>
        )}
        {subreddits["moderator"].length > 0 && (
          <>
            <SectionHeading title="moderator" />
            {subreddits["moderator"].map((sub) => (
              <SubredditCompactLink key={sub.name} subreddit={sub} />
            ))}
          </>
        )}
        {subreddits["subscriber"].length > 0 && (
          <>
            <SectionHeading title="subscriber" />
            {subreddits["subscriber"].map((sub) => (
              <SubredditCompactLink key={sub.name} subreddit={sub} />
            ))}
          </>
        )}
        {subreddits["trending"].length > 0 && (
          <>
            <SectionHeading title="trending" />
            {subreddits["trending"].map((sub) => (
              <SubredditCompactLink key={sub.name} subreddit={sub} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bigButtonContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
  },
  bigButtonSubContainer: {
    flex: 1,
    flexDirection: "row",
  },
  bigButtonIconContainer: {
    width: 40,
    height: 40,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
  subredditsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {},
  categoryTitleContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  categoryTitle: {
    marginVertical: 2,
    fontWeight: "500",
  },
  subredditDescription: {
    fontSize: 12,
    marginTop: 5,
  },
  subredditText: {
    fontSize: 16,
  },
});
