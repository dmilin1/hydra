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

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

export const updateInfo = {
  updateKey: "3.0.0-1",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [
    {
      title: "Better Summaries",
      description:
        "Post and comment summaries have been upgraded to use a more powerful model making them more accurate and easier to read.",
    },
  ] as { title: string; description: string }[],
  features: [
    {
      title: "Custom Icons",
      description:
        "Change Hydra's app icon! Our first icon called \"Cerberus\" by /u/batjake is available under Settings => App Icon. Reach out to me /u/dmilin, if you'd like to contribute a custom icon!",
    },
    {
      title: "Move Next Comment Button",
      description:
        "Drag the next comment button to move it to a different spot. There are now 10 different spots you can lock it to.",
    },
    {
      title: "Quick Subreddit Search",
      description:
        "Quickly search for subreddits by long pressing on the search tab.",
    },
    {
      title: "Search + Sort",
      description:
        "Apply a sort after searching a subreddit. Sorting no longer requires a full page reload.",
    },
    {
      title: "Customize Swipe Actions",
      description:
        "Customize the swipe actions when swiping on posts and comments. Change these in Settings => General => Gestures.",
    },
    {
      title: "Subreddit Filtering",
      description:
        "Filter subreddits from your /r/all and /r/popular feeds by long pressing on posts while on those feeds. To stop filtering, go to Settings => General => Filters => Filtered Subreddits.",
    },
    {
      title: "Hide Post/Link Text",
      description:
        'The "Post text max lines" and "Link text max lines" settings can now be set to 0 to hide the text completely. You can set this under Settings => Appearance => Post Appearance Settings.',
    },
    {
      title: "Optimized Subreddit List",
      description:
        "Some of you are subscribed to an absurd number of subreddits and I think it's been causing performance problems. Hydra no longer prerenders them all in the background resulting in much better overall app performance.",
    },
    {
      title: "Image Cache Improvements",
      description:
        "The image cache now auto clears on startup if bigger than 512MB. Long time users should notice better performance and less storage usage.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description:
        "Fixed text rendering bug causing the ends of comments to be cut off. Finally... This one took me 2 years to solve! If you see this come up again, please send me a screenshot.",
    },
    {
      description:
        "Fixed duplicate incoming hydra://openURL links with the same URL not triggering.",
    },
    {
      description:
        "Fixed case sensitivity of incoming hydra://openURL links. Now it's case insensitive to reduce errors.",
    },
    {
      description:
        "Hydra will now pop a message when your Reddit session expires. You can log back in by pressing the + button in the top right corner of the account tab.",
    },
    {
      description:
        "Cleaned up some unnecessary video player code. Hopefully resulting in a smoother experience.",
    },
    {
      description:
        "Fixed a post submission error on subreddits that don't support flairs.",
    },
    {
      description:
        "Fixed comment flairs being difficult to read when using certain themes.",
    },
    {
      description:
        "Fixed the reload indicator missing on the post details page.",
    },
    {
      description:
        "Fixed infinite scroll sometimes not loading beyond the first page after refreshing.",
    },
    {
      description: "Better post flair alignment in compact mode.",
    },
    {
      description: "Tweaked divider color in light mode for better contrast.",
    },
    {
      description:
        "Fixed image flicker if your scroll gesture starts over an image.",
    },
    {
      description:
        'Fixed a bug causing "Show Seen Posts" to not work on a specific subreddit when "Hide Seen Posts" is enabled globally.',
    },
    {
      description:
        "Small tweaks to inbox fetching that should reduce rate limit errors.",
    },
    {
      description:
        "Fixed being unable to try pro themes when the system is in dark mode.",
    },
  ] as { description: string }[],
};

export default function UpdateInfo({ onExit }: { onExit: () => void }) {
  const { theme } = useContext(ThemeContext);

  const exitUpdateInfo = () => {
    KeyStore.set(LAST_SEEN_UPDATE_KEY, updateInfo.updateKey);
    onExit();
  };

  return (
    <>
      <View style={styles.updateInfoContainer}>
        <View
          style={[
            styles.updateInfoSubContainer,
            {
              backgroundColor: theme.tint,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.exitButton,
              {
                backgroundColor: theme.verySubtleText,
              },
            ]}
            onPress={() => exitUpdateInfo()}
          >
            <FontAwesome6 name="xmark" size={16} color={theme.subtleText} />
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            {updateInfo.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.subtleText,
              },
            ]}
          >
            {updateInfo.subtitle}
          </Text>
          <ScrollView>
            <View style={{ marginTop: -20 }} />
            {updateInfo.proFeatures.length > 0 && (
              <>
                <Text
                  style={[
                    styles.heading,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  👑 Pro Features
                </Text>
                <View style={styles.listContainer}>
                  {updateInfo.proFeatures.map((feature) => (
                    <View
                      key={feature.title}
                      style={[
                        styles.featureContainer,
                        {
                          backgroundColor: theme.divider,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.featureTitle,
                          {
                            color: theme.text,
                          },
                        ]}
                      >
                        {feature.title}
                      </Text>
                      <Text
                        style={[
                          styles.featureDescription,
                          {
                            color: theme.subtleText,
                          },
                        ]}
                      >
                        {feature.description}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            <Text
              style={[
                styles.heading,
                {
                  color: theme.text,
                },
              ]}
            >
              🚀 Features
            </Text>
            <View style={styles.listContainer}>
              {updateInfo.features.map((feature) => (
                <View
                  key={feature.title}
                  style={[
                    styles.featureContainer,
                    {
                      backgroundColor: theme.divider,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.featureTitle,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      {
                        color: theme.subtleText,
                      },
                    ]}
                  >
                    {feature.description}
                  </Text>
                </View>
              ))}
            </View>
            <Text
              style={[
                styles.heading,
                {
                  color: theme.text,
                },
              ]}
            >
              🐛 Bugfixes
            </Text>
            <View style={styles.listContainer}>
              {updateInfo.bugfixes.map((bugfix) => (
                <View
                  key={bugfix.description}
                  style={[
                    styles.featureContainer,
                    {
                      backgroundColor: theme.divider,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bugfixDescription,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {bugfix.description}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.helpContainer}>
              <View style={styles.helpIcon}>
                <Image
                  source={require("../../../assets/images/subredditIcon.png")}
                  style={{ width: 30, height: 30 }}
                />
              </View>
              <Text
                style={[
                  styles.helpItem,
                  {
                    color: theme.text,
                  },
                ]}
              >
                If you have any feature requests, you can submit them on
                /r/HydraFeatureRequest which can be found in the settings tab
              </Text>
            </View>
            <View style={styles.helpContainer}>
              <View style={styles.helpIcon}>
                <FontAwesome name="github" size={22} color={theme.text} />
              </View>
              <Text
                style={[
                  styles.helpItem,
                  {
                    color: theme.text,
                  },
                ]}
              >
                If you have any familiarity with React Native and want to help,
                you can make a pull request at https://github.com/dmilin1/hydra
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
    fontSize: 22,
    fontWeight: 500,
    marginTop: 25,
    marginBottom: 10,
  },
  featureContainer: {
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 500,
  },
  featureDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  bugfixDescription: {
    fontSize: 14,
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
    gap: 15,
  },
});
