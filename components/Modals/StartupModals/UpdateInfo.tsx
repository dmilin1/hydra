import FontAwesome from "@react-native-vector-icons/fontawesome";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import React, { useContext } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";
import { TextWithRepairedHeight } from "../../Other/TextWithRepairedHeight";
import { useURLNavigation } from "../../../utils/navigation";
import { StackActions } from "@react-navigation/native";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

export const updateInfo = {
  updateKey: "v4.3.0",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [] as { title: string; description: string }[],
  features: [
    {
      title: "Mute Videos by Default",
      description:
        "Pressing a volume button or the unmute button in the media viewer will unmute videos for the rest of the session. Videos will be muted again when you leave the app. You can disable this in Settings => Appearance => Posts => Mute Videos by Default.",
    },
    {
      title: "Chat",
      description:
        'Open Chat by pressing the chat icon in the top right corner of the Inbox tab. When viewing a user\'s profile, press the "Message" button in the ... menu to open a chat with the user.',
    },
    {
      title: "Smarter Trending Subreddits",
      description:
        "The algorithm for loading trending subreddits in the Search tab has been improved to give more relevant results.",
    },
    {
      title: "Hide Next Comment Button",
      description:
        "The next comment button in the comment view can be hidden in Settings => Appearance => Comments => Show Scroll to Next Button.",
    },
    {
      title: "Hide Popular & All",
      description:
        "The Popular and All buttons in the subreddit list can be hidden in Settings => Appearance => Subreddits => Show Popular / Show All.",
    },
    {
      title: "Disable Inbox Replies",
      description:
        'When making a post, you\'ll now see a new "Send replies to my inbox" option. When disabled, you will no longer receive replies to that post in your inbox.',
    },
    {
      title: "Media Viewer Performance",
      description:
        "The media viewer has been optimized to reduce render cycles. Changing device orientation should no longer show a temporary blank screen.",
    },
    {
      title: "Deep Linking for Android",
      description:
        "On Android, Hydra can automatically open when you click links to Reddit's website. Go to Settings => General => Open in Hydra to enable this.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description:
        "The login page could sometimes freeze or report a browser error, causing login to fail.",
    },
    {
      description:
        "The audio track on videos could stutter after rotating the device.",
    },
    {
      description:
        "Pan gestures on zoomed in images would sometimes be counted as a tap by the media viewer overlay.",
    },
    {
      description:
        "Text bodies in NSFW or spoiler posts would sometimes not be blurred correctly.",
    },
    {
      description:
        "In certain cases, Hydra would fail to indicate when a user is banned.",
    },
    {
      description:
        "Certain gestures would cause Hydra to crash after backgrounding the app.",
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
          <TextWithRepairedHeight
            style={[
              styles.versionBadgeText,
              { color: theme.iconPrimary, opacity: 1 },
            ]}
          >
            {updateInfo.updateKey}
          </TextWithRepairedHeight>
          <View
            style={[
              styles.versionBadgeBackground,
              { backgroundColor: theme.iconPrimary },
            ]}
          />
        </View>
        <TextWithRepairedHeight
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
        >
          {updateInfo.title}
        </TextWithRepairedHeight>
        <TextWithRepairedHeight
          style={[
            styles.subtitle,
            {
              color: theme.subtleText,
            },
          ]}
        >
          {updateInfo.subtitle}
        </TextWithRepairedHeight>
        <ScrollView>
          <View style={{ marginTop: -20 }} />
          {updateInfo.proFeatures.length > 0 && (
            <>
              <TextWithRepairedHeight
                style={[
                  styles.heading,
                  {
                    color: theme.text,
                  },
                ]}
              >
                👑 Pro Features
              </TextWithRepairedHeight>
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
                    <TextWithRepairedHeight
                      style={[
                        styles.featureTitle,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {feature.title}
                    </TextWithRepairedHeight>
                    <TextWithRepairedHeight
                      style={[
                        styles.featureDescription,
                        {
                          color: theme.subtleText,
                        },
                      ]}
                    >
                      {feature.description}
                    </TextWithRepairedHeight>
                  </View>
                ))}
              </View>
            </>
          )}
          <TextWithRepairedHeight
            style={[
              styles.heading,
              {
                color: theme.text,
              },
            ]}
          >
            🚀 Features
          </TextWithRepairedHeight>
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
                <TextWithRepairedHeight
                  style={[
                    styles.featureTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {feature.title}
                </TextWithRepairedHeight>
                <TextWithRepairedHeight
                  style={[
                    styles.featureDescription,
                    {
                      color: theme.subtleText,
                    },
                  ]}
                >
                  {feature.description}
                </TextWithRepairedHeight>
              </View>
            ))}
          </View>
          <TextWithRepairedHeight
            style={[
              styles.heading,
              {
                color: theme.text,
              },
            ]}
          >
            🐛 Bugfixes
          </TextWithRepairedHeight>
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
                <TextWithRepairedHeight
                  key={bugfix.description}
                  style={[
                    styles.bugfixDescription,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  - {bugfix.description}
                </TextWithRepairedHeight>
              ))}
            </View>
          </View>
          <TextWithRepairedHeight
            style={[
              styles.heading,
              {
                color: theme.text,
              },
            ]}
          >
            📝 Notes
          </TextWithRepairedHeight>
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
                <TextWithRepairedHeight
                  key={note}
                  style={[
                    styles.bugfixDescription,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {note}
                </TextWithRepairedHeight>
              ))}
            </View>
          </View>
          <View style={styles.helpContainer}>
            <View style={styles.helpIcon}>
              <Image
                source={require("../../../assets/images/subredditIcon.png")}
                style={{ width: 30, height: 30 }}
              />
            </View>
            <TextWithRepairedHeight
              style={[
                styles.helpItem,
                {
                  color: theme.text,
                },
              ]}
            >
              If you have any feature requests, you can submit them on
              /r/HydraFeatureRequest which can be found in the settings tab
            </TextWithRepairedHeight>
          </View>
          <View style={styles.helpContainer}>
            <View style={styles.helpIcon}>
              <FontAwesome name="github" size={22} color={theme.text} />
            </View>
            <TextWithRepairedHeight
              style={[
                styles.helpItem,
                {
                  color: theme.text,
                },
              ]}
            >
              If you have any familiarity with React Native and want to help,
              you can make a pull request at https://github.com/dmilin1/hydra
            </TextWithRepairedHeight>
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
            <TextWithRepairedHeight
              style={[styles.tipJarText, { color: theme.iconOrTextButton }]}
            >
              Leave a tip
            </TextWithRepairedHeight>
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
