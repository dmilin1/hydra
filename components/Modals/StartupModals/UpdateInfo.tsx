import FontAwesome from "@react-native-vector-icons/fontawesome";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import React, { useContext } from "react";
import { View, StyleSheet, ScrollView, Image, Text } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";
import { useURLNavigation } from "../../../utils/navigation";
import { StackActions } from "@react-navigation/native";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

export const updateInfo = {
  updateKey: "v4.5.0",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [] as { title: string; description: string }[],
  features: [
    {
      title: "Liquid Glass Tab Bar",
      description:
        "On iOS 26+, the tab bar now uses Liquid Glass. Hide on Infinite Scroll is now called Minimize on Scroll and shrinks the tab bar down instead of hiding it. You can enable this in Settings => Appearance => Tabs => Minimize on Scroll.",
    },
    {
      title: "iPhone Duo Support",
      description:
        "Hydra now supports the iPhone Duo and adjusts its layout as you fold and unfold it. Since the Duo's side bar covers the edge you'd swipe from to go forward, a forward button now shows next to the back button when there's a page to go forward to.",
    },
    {
      title: "Split View Follows Window Size",
      description:
        "Split view now turns on and off as Hydra's window changes size, like when unfolding an iPhone Duo or resizing Hydra with iPad multitasking.",
    },
    {
      title: "Quick Search & Account Swap",
      description:
        "The new tab bar doesn't support long presses, so these have moved. Tap the Search tab while you're already at the top of it to open quick subreddit search, and tap the Account tab while on your profile to quick swap accounts. I'll be working on a better way to trigger these shortcuts in a future update.",
    },
    {
      title: "Add Users to Multireddits",
      description:
        'User profiles can now be added to a multireddit with the "Add to Multireddit" option in the ... menu on their page.',
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description:
        "The home feed could show posts from subreddits you aren't subscribed to.",
    },
    {
      description: "RedGifs videos would load without sound.",
    },
    {
      description: "Sign in with Apple wouldn't work on the login page.",
    },
    {
      description: "Blurred spoiler media would sometimes not blur properly.",
    },
    {
      description:
        "Text would sometimes overflow its container, especially after changing device orientation.",
    },
    {
      description:
        "Links with bold, italic, or other formatting could render incorrectly in posts, comments, and message previews.",
    },
  ] as { description: string }[],
  notes: [] as string[],
};

export default function UpdateInfo({ onExit }: { onExit: () => void }) {
  const { theme } = useContext(ThemeContext);
  const { dispatch } = useURLNavigation();

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
    marginHorizontal: 20,
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
