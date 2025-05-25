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
  updateKey: "2.7.0-1",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [
    {
      title: "Custom Themes + Sharing",
      description:
        "Design your own themes and share them with other Hydra users at the new /r/HydraThemes subreddit. Sort by top to find community favorites! To make a custom theme, go to Settings => Appearance => Custom Theme +. Themes can be shared when on the /r/HydraThemes subreddit by pressing the art brush icon in the markdown editor.",
    },
  ],
  features: [
    {
      title: "Auto Mark as Read",
      description:
        "Added a setting to automatically mark posts you scroll past as read. Note that this may result in longer page load times since the read posts still have to be loaded. You can enable this setting in Settings => General => Filters => Mark as Seen On Scroll.",
    },
    {
      title: "Support for Crossposts",
      description:
        "Hydra now supports crossposts. The source post will be displayed inside the post card.",
    },
    {
      title: "Custom Startup URL",
      description:
        "You can now startup to any Reddit URL supported by Hydra. This includes things like multireddits or user pages. You can set a custom startup URL in Settings => General => Startup URL.",
    },
    {
      title: "Highlight Post/Comment Text",
      description:
        'Press and hold on a comment, or tap the ... button on a post, to highlight the text and you\'ll discover a new "Select Text" option in the menu. This option allows you to highlight and copy text from posts and comments.',
    },
    {
      title: "Highlight Text When Replying",
      description:
        "When replying to a post or comment, you can now highlight and copy the text of the parent post or comment.",
    },
    {
      title: "Image Gallery Count",
      description:
        "Image galleries will now display the current image number and total image count in the corner.",
    },
    {
      title: "Self Hosted Hydra Server",
      description:
        "Technical users can now host their own Hydra server. To set up a self hosted server, go to Settings => Advanced => Use Custom Server. Source code at github.com/dmilin1/hydra-server",
    },
  ],
  bugfixes: [
    {
      description:
        "Fixed the Apply Default Sort to Home setting not being applied when the app first started up.",
    },
    {
      description: "Fixed navbar buttons sometimes being difficult to click.",
    },
    {
      description: "Fixed multireddits having no navbar title.",
    },
    {
      description:
        "Made the right to left page swipe gesture to go to the future post less sensitive. It should be less likely to trigger when scrolling.",
    },
    {
      description:
        "Fixed show all comments button not appearing when a comment thread was accessed through the user page.",
    },
    {
      description:
        "Fixed a rare bug causing post feeds to fail to load when a post has media without dimensions.",
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
