import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from "react-native";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import KeyStore from "../../../utils/KeyStore";

export const STORE_REVIEW_REQUESTED_KEY = "storeReviewRequested";

export default function PromptForReview({ onExit }: { onExit: () => void }) {
  const { theme } = useContext(ThemeContext);
  const [screen, setScreen] = useState<"prompt" | "success">("prompt");

  const { width, height } = useWindowDimensions();

  const handleRateNow = async () => {
    await Linking.openURL(
      `itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=6478089063&onlyLatestVersion=true&pageNumber=0&sortOrdering=1&type=Purple+Software`,
    );
    setScreen("success");
  };

  const exitPromptForReview = () => {
    KeyStore.set(STORE_REVIEW_REQUESTED_KEY, true);
    onExit();
  };

  return (
    <>
      <View style={styles.promptForReviewContainer}>
        <View
          style={[
            styles.subContainer,
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
            onPress={() => exitPromptForReview()}
          >
            <FontAwesome6 name="xmark" size={16} color={theme.subtleText} />
          </TouchableOpacity>

          <View style={styles.headerArea}>
            <Image
              source={require("../../../assets/images/icon.png")}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>

          {screen === "prompt" ? (
            <>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Enjoying Hydra?
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                A quick rating helps a ton
              </Text>

              <View style={styles.starsRow}>
                <FontAwesome name="star" size={22} color={"#FFD700"} />
                <FontAwesome name="star" size={22} color={"#FFD700"} />
                <FontAwesome name="star" size={22} color={"#FFD700"} />
                <FontAwesome name="star" size={22} color={"#FFD700"} />
                <FontAwesome name="star" size={22} color={"#FFD700"} />
              </View>

              <Text style={[styles.bodyText, { color: theme.text }]}>
                If Hydra makes browsing Reddit better for you, would you mind
                leaving a quick rating or review? It really helps other people
                discover the app.
              </Text>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  onPress={() => exitPromptForReview()}
                  style={[
                    styles.secondaryButton,
                    { borderColor: theme.iconPrimary },
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      { color: theme.iconPrimary },
                    ]}
                  >
                    Maybe later
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRateNow}
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.buttonBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: theme.buttonText },
                    ]}
                  >
                    Rate now
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footerRow}>
                <FontAwesome name="heart" size={14} color={"#ff7aa2"} />
                <Text style={[styles.footerText, { color: theme.subtleText }]}>
                  Thank you for supporting indie software
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: theme.text }]}>
                Thanks for the support!
              </Text>
              <Text style={[styles.subtitle, { color: theme.subtleText }]}>
                You're awesome.
              </Text>
              <View style={[styles.starsRow, { marginBottom: 8 }]}>
                <FontAwesome name="heart" size={28} color="#ff7aa2" />
              </View>
            </>
          )}
        </View>
        <TouchableOpacity
          style={[styles.background, { width, height }]}
          onPress={() => exitPromptForReview()}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  promptForReviewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
    zIndex: 2,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "black",
    opacity: 0.7,
    zIndex: 1,
  },
  subContainer: {
    zIndex: 2,
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
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
  headerArea: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 6,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 12,
  },
  bodyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 6,
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  primaryButtonText: {
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 120,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "600",
    fontSize: 15,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
  },
});
