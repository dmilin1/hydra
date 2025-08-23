import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { MaterialIcons, Feather, FontAwesome } from "@expo/vector-icons";
import { getAppIconName, setAlternateAppIcon } from "expo-alternate-app-icons";

import { useRoute, useURLNavigation } from "../../../../utils/navigation";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";
import { APP_ICONS } from "./AppIcon";

export default function AppIconDetails() {
  const { theme } = useContext(ThemeContext);
  const { params } = useRoute<"SettingsPage">();

  const { pushURL } = useURLNavigation();

  const iconName = params.url.split("/").pop();
  const normalizedIconName = iconName === "default" ? null : iconName;

  const appIcon = APP_ICONS.find((icon) => icon.name === normalizedIconName);
  const currentIcon = getAppIconName();
  const isCurrentIcon = currentIcon === normalizedIconName;

  if (!appIcon) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Icon not found
        </Text>
      </View>
    );
  }

  const handleSetAsAppIcon = async () => {
    try {
      await setAlternateAppIcon(appIcon.name);
    } catch (_error) {
      Alert.alert("Error setting app icon");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconPreview}>
        <Image source={appIcon.icon} style={styles.previewImage} />
        {isCurrentIcon && (
          <View
            style={[
              styles.currentBadge,
              { backgroundColor: theme.iconPrimary },
            ]}
          >
            <MaterialIcons name="check" size={20} color="white" />
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.iconTitle, { color: theme.text }]}>
          {appIcon.prettyName}
        </Text>
      </View>

      {/* Author Profile Section */}
      <View
        style={[styles.authorProfileSection, { backgroundColor: theme.tint }]}
      >
        <View style={styles.authorHeader}>
          <Image source={appIcon.authorAvatar} style={styles.authorAvatar} />
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: theme.text }]}>
              {appIcon.authorRedditUsername}
            </Text>
            <Text style={[styles.creatorLabel, { color: theme.subtleText }]}>
              Icon Creator
            </Text>
          </View>
        </View>

        <Text style={[styles.authorBio, { color: theme.text }]}>
          {appIcon.authorBio}
        </Text>
      </View>

      <View style={[styles.linksSection, { backgroundColor: theme.tint }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Links</Text>

        {[
          {
            type: "reddit",
            showIf: appIcon.authorRedditUsername,
            icon: <FontAwesome name="reddit" size={20} color="#FF4500" />,
            onPress: () =>
              pushURL(`https://reddit.com/${appIcon.authorRedditUsername}`),
            text: appIcon.authorRedditUsername,
          },
          {
            type: "website",
            showIf: appIcon.authorWebsite,
            icon: <Feather name="globe" size={20} color={theme.iconPrimary} />,
            onPress: () =>
              appIcon.authorWebsite && Linking.openURL(appIcon.authorWebsite),
            text: "Website",
          },
          {
            type: "instagram",
            showIf: appIcon.authorInstagram,
            icon: <FontAwesome name="instagram" size={20} color="#E4405F" />,
            onPress: () =>
              appIcon.authorInstagram &&
              Linking.openURL(
                `https://instagram.com/${appIcon.authorInstagram?.replace("@", "") || ""}`,
              ),
            text: appIcon.authorInstagram,
          },
        ]
          .filter((link) => link.showIf)
          .map((link, i, list) => (
            <TouchableOpacity
              key={link.type}
              style={[
                styles.linkRow,
                {
                  borderBottomColor: theme.divider,
                  borderBottomWidth:
                    i === list.length - 1 ? 0 : StyleSheet.hairlineWidth,
                },
              ]}
              onPress={link.onPress}
            >
              {link.icon}
              <Text style={[styles.linkText, { color: theme.text }]}>
                {link.text}
              </Text>
              <MaterialIcons
                name="open-in-new"
                size={16}
                color={theme.subtleText}
              />
            </TouchableOpacity>
          ))}
      </View>

      <TouchableOpacity
        style={[
          styles.setIconButton,
          {
            backgroundColor: isCurrentIcon ? theme.divider : theme.iconPrimary,
          },
        ]}
        onPress={handleSetAsAppIcon}
        activeOpacity={0.8}
        disabled={isCurrentIcon}
      >
        <FontAwesome
          name={isCurrentIcon ? "check" : "mobile-phone"}
          size={24}
          color="white"
        />
        <Text style={styles.buttonText}>
          {isCurrentIcon ? "Current App Icon" : `Set as App Icon`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
  },
  iconPreview: {
    alignSelf: "center",
    marginBottom: 30,
    position: "relative",
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 27,
  },
  currentBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  authorProfileSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  authorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  creatorLabel: {
    fontSize: 14,
  },
  authorBio: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  linksSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  setIconButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: "auto",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});
