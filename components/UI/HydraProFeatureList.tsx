import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

export default function HydraProFeatureList({
  invertColors,
}: {
  invertColors?: boolean;
}) {
  const { theme } = useContext(ThemeContext);

  const features = [
    {
      icon: <Ionicons name="notifications" size={24} color={theme.text} />,
      title: "Inbox Alerts",
      description: "Get instant alerts for replies and messages",
    },
    {
      icon: <Ionicons name="filter" size={24} color={theme.text} />,
      title: "Advanced Post Filtering",
      description: "Post filtering powered by machine learning",
    },
    {
      icon: <Ionicons name="document-text" size={24} color={theme.text} />,
      title: "Post & Comment Summaries",
      description: "Quick summaries of long posts and threads",
    },
    {
      icon: <Ionicons name="color-palette" size={24} color={theme.text} />,
      title: "Additional Themes",
      description: "Customize your app with premium themes",
    },
    {
      icon: <Ionicons name="heart" size={24} color={theme.text} />,
      title: "Support Hydra",
      description: "Support me with Hydra's ongoing development costs",
    },
  ];

  return (
    <View style={styles.featuresContainer}>
      {features.map((feature) => (
        <View
          key={feature.title}
          style={[
            styles.featureItem,
            { backgroundColor: invertColors ? theme.background : theme.tint },
          ]}
        >
          <View
            style={[
              styles.featureIcon,
              { backgroundColor: invertColors ? theme.tint : theme.background },
            ]}
          >
            {feature.icon}
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              {feature.title}
            </Text>
            <Text
              style={[styles.featureDescription, { color: theme.subtleText }]}
            >
              {feature.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  featuresContainer: {
    paddingHorizontal: 0,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
});
