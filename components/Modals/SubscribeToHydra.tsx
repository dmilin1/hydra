import { FontAwesome6 } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useMMKVNumber } from "react-native-mmkv";

import { AccountContext } from "../../contexts/AccountContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../../contexts/SubredditContext";

export default function SubscribeToHydra() {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { subreddits, subscribe, isLoadingSubreddits } =
    useContext(SubredditContext);

  const [lastAskedAt, setLastAskedAt] = useMMKVNumber(
    `lastAskedToSubscribeToHydraClient-${currentUser?.id}`,
  );
  const [isSubcribing, setIsSubscribing] = useState(false);

  const shouldAsk = !!(
    currentUser &&
    (lastAskedAt ?? 0) + 1000 * 60 * 60 * 24 * 365 < Date.now() &&
    !isLoadingSubreddits &&
    subreddits.subscriber.length &&
    !subreddits.subscriber.find(
      (sub) => sub.name.toLowerCase() === "hydraclient",
    )
  );

  const answeredModal = () => {
    setLastAskedAt(Date.now());
  };

  const subscribeToHydra = async () => {
    if (isSubcribing) return;
    setIsSubscribing(true);
    await subscribe("hydraclient");
    setIsSubscribing(false);
    setLastAskedAt(Date.now());
  };

  return (
    shouldAsk && (
      <>
        <View style={styles.container}>
          <View style={styles.subContainer}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.tint,
                  borderColor: theme.divider,
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
                onPress={() => answeredModal()}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="xmark" size={14} color={theme.subtleText} />
              </TouchableOpacity>

              <View style={styles.iconContainer}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: theme.verySubtleText,
                    },
                  ]}
                >
                  <FontAwesome6 name="bell" size={28} color={theme.text} />
                </View>
              </View>

              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Stay Updated with Hydra
              </Text>
              <Text
                style={[
                  styles.description,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                Join /&#8288;r/&#8288;HydraClient to get the latest updates,
                feature announcements, and join discussions about the app.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      borderColor: theme.divider,
                    },
                  ]}
                  onPress={() => answeredModal()}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cancelText,
                      {
                        color: theme.subtleText,
                      },
                    ]}
                  >
                    Maybe Later
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    {
                      backgroundColor: theme.iconPrimary,
                    },
                  ]}
                  onPress={() => subscribeToHydra()}
                  activeOpacity={0.8}
                >
                  {isSubcribing ? (
                    <ActivityIndicator size="small" color={theme.text} />
                  ) : (
                    <Text
                      style={[
                        styles.subscribeText,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      Join
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.background}
          onPress={() => answeredModal()}
          activeOpacity={0.25}
        />
      </>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  subContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: 10,
    paddingVertical: 125,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    opacity: 0.6,
    zIndex: 1,
  },
  card: {
    zIndex: 2,
    maxWidth: "100%",
    borderRadius: 20,
    borderWidth: 1,
    paddingBottom: 24,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  exitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: "absolute",
    top: 16,
    right: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 32,
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    marginHorizontal: 24,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  subscribeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
