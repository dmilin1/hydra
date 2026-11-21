import FontAwesome from "@react-native-vector-icons/fontawesome";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import React, { useContext } from "react";
import { View, StyleSheet, ScrollView, Image, Text } from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";
import { useURLNavigation } from "../../../utils/navigation";
import { StackActions } from "@react-navigation/native";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

export const updateInfo = {
  updateKey: "v4.6.0",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [
    {
      title: "Improved Smart Post Filters",
      description:
        "Smart filters use a much faster and smarter model for filtering posts. This should significantly improve page load times and filtering accuracy. You can enable smart post filtering in Settings => General => Filters => Smart Post Filters.",
    },
    {
      title: "Multi Device Notifications",
      description:
        "If you have multiple devices under the same Apple App Store account or Google Play Store account, Hydra will now send push notifications to all of them.",
    },
  ] as { title: string; description: string }[],
  features: [
    {
      title: "Home Feed Picker",
      description:
        "The home page now lets you switch between the Following feed, the For You feed, and a Classic feed that shows the old Reddit front page. Hydra remembers whichever one you used last. The classic feed may be a bit slower to load than the other feeds.",
    },
    {
      title: "Redesigned Search",
      description:
        "Search has been rebuilt. Tap the Search tab from anywhere and it opens over the tab you were on. Before you type, it shows your recent searches, favorite subreddits, and subreddits to discover. As you type, it suggests your subreddits, subreddits across Reddit, a search within the subreddit you came from, and a shortcut to jump straight to any r/ or u/ you type or Reddit link you paste. On iOS 26.1+, Search is the separate button beside the tab bar. This replaces quick subreddit search.",
    },
    {
      title: "Account Restriction Notices",
      description:
        'Hydra now lets you know when your account has been flagged for a password reset or has been suspended, instead of Reddit just saying "Permission denied" when you try to do something.',
    },
    {
      title: "Updated Segmented Pickers",
      description:
        "The pickers used to switch between options across the app, like in search results, new posts, and theme settings, have a cleaner, consistent look.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description: "Hydra would crash at startup on iOS 16 and iOS 17.",
    },
    {
      description: "/r/all stopped working due to Reddit API changes.",
    },
    {
      description:
        "Images in comments hosted through CloudFlare would show as links instead of images.",
    },
    {
      description:
        "Hydra could keep using a custom server after the setting was turned off.",
    },
    {
      description: "Action sheet menus were slow to close.",
    },
    {
      description:
        "Swiping on a comment could cause the page to shift slightly.",
    },
    {
      description:
        "The theme picker in the markdown editor didn't respect safe areas, making the exit button unclickable on some devices.",
    },
    {
      description:
        "On the iPhone Duo, tapping certain parts of the navbar would fail to scroll to the top when folded.",
    },
    {
      description:
        "On the iPhone Duo, the accounts button would disappear from the user tab after swapping accounts.",
    },
    {
      description:
        "On the iPhone Duo, the update info popup would overflow the sidebar.",
    },
  ] as { description: string }[],
  notes: [] as string[],
};

export default function UpdateInfo({ onExit }: { onExit: () => void }) {
  const { theme } = useContext(ThemeContext);
  const { dispatch } = useURLNavigation();
  const { left, right } = useSafeAreaInsets();

  const exitUpdateInfo = () => {
    KeyStore.set(LAST_SEEN_UPDATE_KEY, updateInfo.updateKey);
    onExit();
  };

  return (
    <View style={styles.updateInfoContainer}>
      <View
        style={[
          styles.updateInfoSubContainer,
          {
            backgroundColor: theme.tint,
            borderColor: theme.divider,
            marginLeft: 20 + left,
            marginRight: 20 + right,
          },
        ]}
      >
        <Touchable
          activeOpacity={0.2}
          animationDuration={{ in: 0, out: 150 }}
          style={[
            styles.exitButton,
            {
              backgroundColor: theme.divider,
            },
          ]}
          onPress={() => exitUpdateInfo()}
        >
          <FontAwesome6
            iconStyle="solid"
            name="xmark"
            size={16}
            color={theme.subtleText}
          />
        </Touchable>
        <View style={styles.versionBadge}>
          <Text
            style={[
              styles.versionBadgeText,
              { color: theme.iconPrimary, opacity: 1 },
            ]}
          >
            {updateInfo.updateKey}
          </Text>
          <View
            style={[
              styles.versionBadgeBackground,
              { backgroundColor: theme.iconPrimary },
            ]}
          />
        </View>
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
                        backgroundColor: theme.background,
                        borderColor: theme.divider,
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
                    backgroundColor: theme.background,
                    borderColor: theme.divider,
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
            <View
              style={[
                styles.featureContainer,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.divider,
                  gap: 12,
                },
              ]}
            >
              {updateInfo.bugfixes.map((bugfix) => (
                <Text
                  key={bugfix.description}
                  style={[
                    styles.bugfixDescription,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  - {bugfix.description}
                </Text>
              ))}
            </View>
          </View>
          {updateInfo.notes.length > 0 && (
            <>
              <Text
                style={[
                  styles.heading,
                  {
                    color: theme.text,
                  },
                ]}
              >
                📝 Notes
              </Text>
              <View style={styles.listContainer}>
                <View
                  style={[
                    styles.featureContainer,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.divider,
                      gap: 12,
                    },
                  ]}
                >
                  {updateInfo.notes.map((note) => (
                    <Text
                      key={note}
                      style={[
                        styles.bugfixDescription,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {note}
                    </Text>
                  ))}
                </View>
              </View>
            </>
          )}
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
          <View style={styles.getHydraProContainer}>
            <GetHydraProButton onPress={() => exitUpdateInfo()} />
          </View>
          <Touchable
            style={styles.tipJarContainer}
            activeOpacity={0.5}
            animationDuration={{ in: 0, out: 150 }}
            onPress={() => {
              dispatch(
                StackActions.push("SettingsPage", {
                  url: "hydra://settings/tipJar",
                }),
              );
              exitUpdateInfo();
            }}
          >
            <Text
              style={[styles.tipJarText, { color: theme.iconOrTextButton }]}
            >
              Leave a tip
            </Text>
          </Touchable>
        </ScrollView>
      </View>
      <Touchable style={styles.background} onPress={() => exitUpdateInfo()} />
    </View>
  );
}

const styles = StyleSheet.create({
  updateInfoContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  updateInfoSubContainer: {
    position: "absolute",
    top: "12.5%",
    maxHeight: "75%",
    zIndex: 2,
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 1,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    opacity: 0.75,
    zIndex: 1,
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
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginVertical: 8,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  versionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  versionBadgeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  heading: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: 500,
    marginTop: 25,
    marginBottom: 10,
    marginLeft: -8,
  },
  featureContainer: {
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 500,
  },
  featureDescription: {
    fontSize: 14,
    marginTop: 5,
    lineHeight: 18,
  },
  bugfixDescription: {
    fontSize: 14,
    lineHeight: 17.9,
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
  getHydraProContainer: {
    marginTop: 10,
  },
  tipJarContainer: {
    paddingTop: 10,
    paddingBottom: 30,
    marginHorizontal: 20,
  },
  tipJarText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
