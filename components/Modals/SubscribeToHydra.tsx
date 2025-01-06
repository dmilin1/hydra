import { FontAwesome6 } from "@expo/vector-icons";
import { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useMMKVNumber } from "react-native-mmkv";

import { AccountContext } from "../../contexts/AccountContext";
import { t, ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../../contexts/SubredditContext";

export default function SubscribeToHydra() {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { subreddits, subscribe, isLoadingSubreddits } =
    useContext(SubredditContext);

  const [lastAskedAt, setLastAskedAt] = useMMKVNumber(
    `lastAskedToSubscribeToHydra-${currentUser?.id}`,
  );
  const [isSubcribing, setIsSubscribing] = useState(false);

  const shouldAsk = !!(
    currentUser &&
    (lastAskedAt ?? 0) + 1000 * 60 * 60 * 24 * 365 < Date.now() &&
    !isLoadingSubreddits &&
    subreddits.subscriber.length &&
    !subreddits.subscriber.find((sub) => sub.name.toLowerCase() === "hydraapp")
  );

  const answeredModal = () => {
    setLastAskedAt(Date.now());
  };

  const subscribeToHydra = async () => {
    if (isSubcribing) return;
    setIsSubscribing(true);
    await subscribe("hydraapp");
    setIsSubscribing(false);
    setLastAskedAt(Date.now());
  };

  return (
    shouldAsk && (
      <>
        <View style={styles.subscribeContainer}>
          <View
            style={t(styles.subscribeSubContainer, {
              backgroundColor: theme.tint,
            })}
          >
            <TouchableOpacity
              style={t(styles.exitButton, {
                backgroundColor: theme.verySubtleText,
              })}
              onPress={() => answeredModal()}
            >
              <FontAwesome6 name="xmark" size={16} color={theme.subtleText} />
            </TouchableOpacity>
            <Text
              style={t(styles.title, {
                color: theme.text,
              })}
            >
              Subscribe to Hydra?
            </Text>
            <Text
              style={t(styles.description, {
                color: theme.subtleText,
              })}
            >
              Would you like to subscribe to the /&#8288;r/&#8288;HydraApp
              subreddit?
            </Text>
            <Text
              style={t(styles.description, {
                color: theme.subtleText,
              })}
            >
              New updates to Hydra and discussions about the app will appear in
              your Home feed.
            </Text>
            <TouchableOpacity
              style={t(styles.subscribeButton, {
                backgroundColor: theme.iconPrimary,
              })}
              onPress={() => subscribeToHydra()}
              activeOpacity={0.8}
            >
              {isSubcribing ? (
                <ActivityIndicator size="small" color={theme.text} />
              ) : (
                <Text
                  style={t(styles.subscribeText, {
                    color: theme.text,
                  })}
                >
                  Subscribe
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.background}
          onPress={() => answeredModal()}
        />
      </>
    )
  );
}

const styles = StyleSheet.create({
  subscribeContainer: {
    position: "absolute",
    top: 0,
    zIndex: 2,
    marginTop: Dimensions.get("window").height * 0.2,
    flex: 1,
    justifyContent: "center",
    maxHeight: Dimensions.get("window").height * 0.6,
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
  subscribeSubContainer: {
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
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 50,
    marginTop: 20,
    marginBottom: 15,
  },
  description: {
    marginHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
  },
  subscribeButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 45,
  },
  subscribeText: {
    fontSize: 18,
  },
});
