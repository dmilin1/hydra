import { MaterialIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { Touchable } from "react-native-gesture-handler";

import {
  APP_ICON_AUTHORS,
  APP_ICON_SOURCES,
} from "../../../../constants/appIcons";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";
import { getCurrentAppIcon } from "../../../../utils/appIcons";
import { useURLNavigation } from "../../../../utils/navigation";

type AuthorId = keyof typeof APP_ICON_AUTHORS;

export type Author = (typeof APP_ICON_AUTHORS)[AuthorId] & {
  avatar: ImageSourcePropType;
};

export type Icon = {
  /** null is the stock Hydra icon. */
  key: string | null;
  prettyName: string;
  preview: ImageSourcePropType;
  author: Author;
};

const AUTHOR_AVATARS: Record<AuthorId, ImageSourcePropType> = {
  dmilin: require("../../../../assets/images/custom_icons/authors/dmilin.jpg"),
  batjake: require("../../../../assets/images/custom_icons/authors/batjake.png"),
  boxsitter: require("../../../../assets/images/custom_icons/authors/boxsitter.png"),
};

/**
 * Previews shown in this list. Metro only understands literal require() paths,
 * so this is the one thing that can't be derived from constants/appIcons.js —
 * add an entry here whenever you add an icon there.
 */
const ICON_PREVIEWS: Record<string, ImageSourcePropType> = {
  cerberus: require("../../../../assets/images/custom_icons/cerberus.png"),
  hail_hydra: require("../../../../assets/images/custom_icons/hail_hydra.png"),
  hail_hydra_dark: require("../../../../assets/images/custom_icons/hail_hydra_dark.png"),
};

const DEFAULT_ICON_PREVIEW = require("../../../../assets/images/icon.png");

if (__DEV__) {
  const missing = APP_ICON_SOURCES.filter((icon) => !ICON_PREVIEWS[icon.key]);

  if (missing.length) {
    throw new Error(
      `Missing ICON_PREVIEWS entries in AppIcon.tsx for: ${missing
        .map((icon) => icon.key)
        .join(", ")} — see the checklist in constants/appIcons.js`,
    );
  }
}

function authorFor(id: AuthorId): Author {
  return { ...APP_ICON_AUTHORS[id], avatar: AUTHOR_AVATARS[id] };
}

export const APP_ICONS: Icon[] = [
  {
    key: null,
    prettyName: "Hydra",
    preview: DEFAULT_ICON_PREVIEW,
    author: authorFor("dmilin"),
  },
  ...APP_ICON_SOURCES.map((icon) => ({
    key: icon.key,
    prettyName: icon.prettyName,
    preview: ICON_PREVIEWS[icon.key],
    author: authorFor(icon.author),
  })),
];

export default function AppIcon() {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  const currentIcon = getCurrentAppIcon();

  const handleIconPress = (appIcon: Icon) => {
    pushURL(`hydra://settings/appIconDetails/${appIcon.key || "default"}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconsGrid}>
        {APP_ICONS.map((appIcon) => (
          <Touchable
            key={appIcon.key || "default"}
            style={[
              styles.iconCard,
              {
                backgroundColor: theme.tint,
                borderColor:
                  currentIcon === appIcon.key
                    ? theme.iconPrimary
                    : "transparent",
              },
            ]}
            onPress={() => handleIconPress(appIcon)}
            activeOpacity={0.7}
            animationDuration={{ in: 0, out: 150 }}
          >
            <Image source={appIcon.preview} style={styles.iconImage} />
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
            {currentIcon === appIcon.key && (
              <View
                style={[
                  styles.currentBadge,
                  { backgroundColor: theme.iconPrimary },
                ]}
              >
                <MaterialIcons name="check" size={16} color="white" />
              </View>
            )}
          </Touchable>
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
