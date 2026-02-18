import React, { useContext } from "react";
import { getAppIconName } from "expo-alternate-app-icons";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";

import { useURLNavigation } from "../../../../utils/navigation";

type Icon = {
  name: string | null;
  prettyName: string;
  icon: ImageSourcePropType;
  author: Author;
};

type Author = {
  avatar: ImageSourcePropType;
  redditUsername: string;
  website?: string;
  instagram?: string;
  bio: string;
};

const AUTHORS = {
  dmilin: {
    avatar: require("../../../../assets/images/custom_icons/authors/dmilin.jpg"),
    redditUsername: "u/dmilin",
    website: "https://github.com/dmilin1/hydra",
    bio: "Hi, I'm Dimitrie, the developer of Hydra. I'm a software engineer and have been building apps for almost 2 decades. I built Hydra to craft the best possible Reddit experience for myself and others.",
  },
  batjake: {
    avatar: require("../../../../assets/images/custom_icons/authors/batjake.png"),
    redditUsername: "u/batjake",
    website: "http://brokendiamonddesign.com/",
    instagram: "@bdiamonddesigns",
    bio: "Hi, I'm Jake, a graphic designer with 10+ years of experience creating bold logos, striking album art, and brand visuals that resonate. I specialize in helping businesses and musicians stand out with designs that capture essence, tell stories, and leave lasting impressions.",
  },
  boxsitter: {
    avatar: require("../../../../assets/images/custom_icons/authors/boxsitter.png"),
    redditUsername: "u/boxsitter",
    bio: "Hi, I'm Boxsitter, a hobbyist designer who wanted to create something special for this app. Because I run the open-source server myself, I designed this icon as a way to support the project in lieu of a subscription. I hope you enjoy this reminder that if you cut off one head, two more shall take its place. Hail Hydra!",
  },
} satisfies Record<string, Author>;

export const APP_ICONS: Icon[] = [
  {
    name: null,
    prettyName: "Hydra",
    icon: require("../../../../assets/images/icon.png"),
    author: AUTHORS.dmilin,
  },
  {
    name: "cerberus",
    prettyName: "Cerberus",
    icon: require("../../../../assets/images/custom_icons/cerberus.png"),
    author: AUTHORS.batjake,
  },
  {
    name: "hail_hydra",
    prettyName: "Hail Hydra!",
    icon: require("../../../../assets/images/custom_icons/hail_hydra.png"),
    author: AUTHORS.boxsitter,
  },
  {
    name: "hail_hydra_dark",
    prettyName: "Hail Hydra! (Dark)",
    icon: require("../../../../assets/images/custom_icons/hail_hydra_dark.png"),
    author: AUTHORS.boxsitter,
  },
];

export default function AppIcon() {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  const currentIcon = getAppIconName();

  const handleIconPress = (appIcon: Icon) => {
    pushURL(`hydra://settings/appIconDetails/${appIcon.name || "default"}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconsGrid}>
        {APP_ICONS.map((appIcon) => (
          <TouchableOpacity
            key={appIcon.name || "default"}
            style={[
              styles.iconCard,
              {
                backgroundColor: theme.tint,
                borderColor:
                  currentIcon === appIcon.name
                    ? theme.iconPrimary
                    : "transparent",
              },
            ]}
            onPress={() => handleIconPress(appIcon)}
            activeOpacity={0.7}
          >
            <Image source={appIcon.icon} style={styles.iconImage} />
            <Text style={[styles.iconName, { color: theme.text }]}>
              {appIcon.prettyName}
            </Text>
            <View style={styles.authorSection}>
              <Image
                source={appIcon.author.avatar}
                style={styles.authorAvatar}
              />
              <Text style={[styles.authorName, { color: theme.subtleText }]}>
                {appIcon.author.redditUsername}
              </Text>
            </View>
            {currentIcon === appIcon.name && (
              <View
                style={[
                  styles.currentBadge,
                  { backgroundColor: theme.iconPrimary },
                ]}
              >
                <MaterialIcons name="check" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 25,
    textAlign: "center",
  },
  iconsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 15,
  },
  iconCard: {
    width: "45%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    position: "relative",
  },
  iconImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
    marginBottom: 12,
  },
  iconName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  authorName: {
    fontSize: 12,
    textAlign: "center",
  },
  currentBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
