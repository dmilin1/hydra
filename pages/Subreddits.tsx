import { FontAwesome5, Feather, FontAwesome } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

import { Subreddits as SubredditsObj } from "../api/Subreddits";
import { HistoryFunctionsContext } from "../contexts/HistoryContext";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../contexts/SubredditContext";

export default function Subreddits() {
  const { theme } = useContext(ThemeContext);
  const history = useContext(HistoryFunctionsContext);
  const { subreddits, toggleFavorite } = useContext(SubredditContext);

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
            onPress={() => history.pushPath(link.path)}
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
        {(
          [
            "favorites",
            "moderator",
            "subscriber",
            "trending",
          ] as (keyof SubredditsObj)[]
        )
          .filter((key) => subreddits[key].length > 0)
          .map((key) => (
            <View style={styles.categoryContainer} key={key}>
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
                  {key.toUpperCase()}
                </Text>
              </View>
              {subreddits[key]
                .sort((a, b) =>
                  a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
                )
                .map((subreddit) => (
                  <View key={subreddit.name}>
                    <TouchableOpacity
                      key={subreddit.name}
                      onPress={() => history.pushPath(subreddit.url)}
                      activeOpacity={0.5}
                      style={t(styles.subredditContainer, {
                        borderBottomColor: theme.tint,
                      })}
                    >
                      <>
                        {subreddit.iconURL ? (
                          <Image
                            source={{ uri: subreddit.iconURL }}
                            style={styles.subredditIcon}
                          />
                        ) : (
                          <FontAwesome
                            name="reddit"
                            size={30}
                            color={theme.text}
                          />
                        )}
                        <Text
                          style={t(styles.subredditText, {
                            color: theme.text,
                          })}
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
                  </View>
                ))}
            </View>
          ))}
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
  subredditDescription: {
    fontSize: 12,
    marginTop: 5,
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
