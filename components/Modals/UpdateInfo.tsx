import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useMMKVString } from "react-native-mmkv";

import { t, ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../UI/GetHydraProButton";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

const update = {
  updateKey: "2.6.0-1",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [
    {
      title: "Post & Comment Summaries",
      description:
        "Quick summaries appear at the top of long posts and threads. This is enabled by default, but you can disable it in Settings => Appearance => Show Post/Comment Summary.",
    },
    {
      title: "Advanced Post Filtering",
      description:
        "Post filtering powered by machine learning. Tired of all the politics? This catches posts that the regular word filter misses. To enable, go to Settings => General => Filters => Smart Post Filter. You can write a custom filter or use one of the pre-made filters.",
    },
    {
      title: "Inbox Alerts",
      description:
        "Get instant alerts for replies and messages. Enabled by default. You can disable it in the iOS System Settings.",
    },
    {
      title: "New Themes",
      description:
        "Five new premium themes: Gilded, Ocean, Aurora, Royal, and Mulberry. To enable these themes, go to Settings => Theme. Even if you don't have Hydra Pro, you can still try these themes out.",
    },
    {
      title: "Support Hydra",
      description:
        "Even if the features above don't interest you, Hydra Pro is a great way to support Hydra's ongoing development costs. Hydra is not self sustainable right now, so any support is greatly appreciated!",
    },
  ],
  features: [
    {
      title: "New Themes",
      description:
        "Two new themes: Strawberry and Spiderman. To enable these themes, go to Settings => Theme.",
    },
    {
      title: "Save Comments",
      description:
        "Comments can now be saved with a swipe to the left or a long press. You can view your saved comments in the Account tab.",
    },
    {
      title: "Save Posts Easier",
      description:
        "Posts can now be saved without having to click into them. To quickly save a post, long swipe to the left. You can view your saved posts in the Account tab.",
    },
    {
      title: "Saved Indicators",
      description:
        "Posts and comments that you have saved will now have a small indicator in the bottom right corner of the post/comment.",
    },
    {
      title: "Drafts",
      description:
        "Your posts, comments, and replies are now automatically saved as drafts. Exiting out midway through typing and reopening the text entry modal will show your previous text where you left off. Thanks to Ronak Vir for implementing this feature!",
    },
    {
      title: "Apply Default Sort to Home",
      description:
        "Added a setting to apply the default post sort setting to the home page. To enable this, go to Settings => General => Sorting => Apply sort to home.",
    },
    {
      title: "Hide Account Tab Username",
      description:
        "You can now prevent your username from being displayed on the account tab button. To disable your username from showing, go to Settings => Appearance => Show username and toggle it off.",
    },
    {
      title: "Better Tables",
      description:
        "Wide tables are now horizontally scrollable, preventing text from getting crammed. This should be a big help for those sports posts full of data.",
    },
    {
      title: "Post Title Line Limit",
      description:
        "The max configurable post title line limit has been increased from 5 lines to 10 for those really long post titles. You can change this in Settings => Appearance => Post title max lines.",
    },
    {
      title: "Smarter Loading",
      description:
        "Hydra now loads infinite scrolls in a more efficient manner. This should result in fewer API calls and faster loads. You'll notice this most if you have a lot of filters enabled.",
    },
    {
      title: "View Patch Notes",
      description:
        "You can now get back to these patch notes at any time by going to Settings => Patch Notes.",
    },
  ],
  bugfixes: [
    {
      description:
        "Some API calls were being duplicated, causing slightly slower loads and more data usage.",
    },
  ],
};

export default function UpdateInfo() {
  const { theme } = useContext(ThemeContext);

  const [lastSeenUpdate, setLastSeenUpdate] =
    useMMKVString(LAST_SEEN_UPDATE_KEY);

  const exitUpdateInfo = () => {
    setLastSeenUpdate(update.updateKey);
  };

  return (
    lastSeenUpdate !== update.updateKey && (
      <>
        <View style={styles.updateInfoContainer}>
          <View
            style={t(styles.updateInfoSubContainer, {
              backgroundColor: theme.tint,
            })}
          >
            <TouchableOpacity
              style={t(styles.exitButton, {
                backgroundColor: theme.verySubtleText,
              })}
              onPress={() => exitUpdateInfo()}
            >
              <FontAwesome6 name="xmark" size={16} color={theme.subtleText} />
            </TouchableOpacity>
            <Text
              style={t(styles.title, {
                color: theme.text,
              })}
            >
              {update.title}
            </Text>
            <Text
              style={t(styles.subtitle, {
                color: theme.subtleText,
              })}
            >
              {update.subtitle}
            </Text>
            <ScrollView>
              <View style={{ marginTop: -20 }} />
              <Text
                style={t(styles.heading, {
                  color: theme.text,
                })}
              >
                👑 Pro Features
              </Text>
              <View style={styles.listContainer}>
                {update.proFeatures.map((feature) => (
                  <View key={feature.title}>
                    <Text
                      style={t(styles.featureTitle, {
                        color: theme.text,
                      })}
                    >
                      • {feature.title}
                    </Text>
                    <Text
                      style={t(styles.featureDescription, {
                        color: theme.subtleText,
                      })}
                    >
                      {feature.description}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                style={t(styles.heading, {
                  color: theme.text,
                })}
              >
                🚀 Features
              </Text>
              <View style={styles.listContainer}>
                {update.features.map((feature) => (
                  <View key={feature.title}>
                    <Text
                      style={t(styles.featureTitle, {
                        color: theme.text,
                      })}
                    >
                      • {feature.title}
                    </Text>
                    <Text
                      style={t(styles.featureDescription, {
                        color: theme.subtleText,
                      })}
                    >
                      {feature.description}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                style={t(styles.heading, {
                  color: theme.text,
                })}
              >
                🐛 Bugfixes
              </Text>
              <View style={styles.listContainer}>
                {update.bugfixes.map((bugfix) => (
                  <View key={bugfix.description}>
                    <Text
                      style={t(styles.bugfixDescription, {
                        color: theme.text,
                      })}
                    >
                      • {bugfix.description}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.helpContainer}>
                <View style={styles.helpIcon}>
                  <Image
                    source={require("../../assets/images/subredditIcon.png")}
                    style={{ width: 30, height: 30 }}
                  />
                </View>
                <Text
                  style={t(styles.helpItem, {
                    color: theme.text,
                  })}
                >
                  If you have any feature requests, you can submit them on
                  /r/HydraFeatureRequests which can be found in the settings tab
                </Text>
              </View>
              <View style={styles.helpContainer}>
                <View style={styles.helpIcon}>
                  <FontAwesome name="github" size={22} color={theme.text} />
                </View>
                <Text
                  style={t(styles.helpItem, {
                    color: theme.text,
                  })}
                >
                  If you have any familiarity with React Native and want to
                  help, you can make a pull request at
                  https://github.com/dmilin1/hydra
                </Text>
              </View>
              <GetHydraProButton onPress={() => exitUpdateInfo()} />
            </ScrollView>
          </View>
        </View>
        <TouchableOpacity
          style={styles.background}
          onPress={() => exitUpdateInfo()}
        />
      </>
    )
  );
}

const styles = StyleSheet.create({
  updateInfoContainer: {
    position: "absolute",
    top: 0,
    zIndex: 2,
    marginTop: Dimensions.get("window").height * 0.175,
    flex: 1,
    justifyContent: "center",
    maxHeight: Dimensions.get("window").height * 0.65,
    maxWidth: Dimensions.get("window").width - 40,
    alignSelf: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    backgroundColor: "black",
    opacity: 0.7,
    zIndex: 1,
  },
  updateInfoSubContainer: {
    borderRadius: 10,
    borderWidth: 1,
  },
  exitButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: "absolute",
    top: 10,
    right: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  heading: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 25,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  featureDescription: {
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 32,
  },
  bugfixDescription: {
    fontSize: 14,
    marginHorizontal: 20,
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  helpIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  helpItem: {
    marginTop: 5,
    fontSize: 14,
    marginHorizontal: 20,
  },
  listContainer: {
    gap: 20,
  },
});
