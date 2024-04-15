import { FontAwesome5, Feather } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import {
  Subreddits as SubredditsObj,
  getSubreddits,
  getTrending,
} from "../api/Subreddits";
import { AccountContext } from "../contexts/AccountContext";
import { HistoryContext } from "../contexts/HistoryContext";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";

export default function Subreddits() {
  const { theme } = useContext(ThemeContext);
  const history = useContext(HistoryContext);
  const { currentUser } = useContext(AccountContext);

  const [subreddits, setSubreddits] = useState<SubredditsObj>({
    moderator: [],
    subscriber: [],
    trending: [],
  });

  const loadSubreddits = async () => {
    if (currentUser) {
      setSubreddits(await getSubreddits());
    } else {
      setSubreddits({
        moderator: [],
        subscriber: [],
        trending: await getTrending({ limit: "30" }),
      });
    }
  };

  useEffect(() => {
    loadSubreddits();
  }, [currentUser]);

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
        {(Object.keys(subreddits) as (keyof SubredditsObj)[])
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
                    color: theme.text,
                  })}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </View>
              {subreddits[key]
                .sort((a, b) =>
                  a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
                )
                .map((subreddit) => (
                  <View key={subreddit.name}>
                    <TouchableHighlight
                      key={subreddit.name}
                      onPress={() => history.pushPath(subreddit.url)}
                      activeOpacity={0.5}
                      style={t(styles.subredditContainer, {
                        borderBottomColor: theme.tint,
                      })}
                    >
                      <Text
                        style={t(styles.subredditText, {
                          color: theme.text,
                        })}
                      >
                        {subreddit.name}
                      </Text>
                    </TouchableHighlight>
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
    borderBottomStyle: "solid",
  },
  bigButtonSubContainer: {
    flex: 1,
    flexDirection: "row",
  },
  bigButtonIconContainer: {
    width: 45,
    height: 45,
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
  categoryTitle: {},
  subredditContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
  },
  subredditText: {
    fontSize: 16,
  },
  subredditDescription: {
    fontSize: 12,
    marginTop: 5,
  },
});
