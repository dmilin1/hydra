import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import type { ColorValue } from "react-native";

import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";

interface Theme {
  tint: ColorValue;
  background: ColorValue;
  text: ColorValue;
  subtleText: ColorValue;
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  theme: Theme;
}

const FeatureItem = ({ icon, title, description, theme }: FeatureItemProps) => (
  <View style={t(styles.featureItem, { backgroundColor: theme.tint })}>
    <View style={t(styles.featureIcon, { backgroundColor: theme.background })}>
      {icon}
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={t(styles.featureTitle, { color: theme.text })}>{title}</Text>
      <Text style={t(styles.featureDescription, { color: theme.subtleText })}>
        {description}
      </Text>
    </View>
  </View>
);

export default function HydraPro() {
  const { theme } = useContext(ThemeContext);
  const { isPro, buyPro, proOffering, isLoadingOffering } =
    useContext(SubscriptionsContext);

  return (
    <>
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/images/HydraPro.png")}
          style={styles.proIcon}
          resizeMode="contain"
        />
        <Text
          style={t(styles.headerText, {
            color: theme.text,
          })}
        >
          Hydra Pro
        </Text>
        <Text
          style={t(styles.subheaderText, {
            color: theme.text,
          })}
        >
          Unlock the full potential of Hydra
        </Text>
        {isLoadingOffering ? (
          <ActivityIndicator
            size="small"
            color={theme.subtleText}
            style={styles.priceLoader}
          />
        ) : (
          proOffering?.product.priceString && (
            <Text
              style={t(styles.priceText, {
                color: theme.subtleText,
              })}
            >
              {proOffering.product.priceString} per month
            </Text>
          )
        )}
      </View>

      <View style={styles.featuresContainer}>
        <FeatureItem
          icon={<Ionicons name="notifications" size={24} color={theme.text} />}
          title="Inbox Notifications"
          description="Get instant alerts for replies and messages"
          theme={theme}
        />
        <FeatureItem
          icon={<Ionicons name="filter" size={24} color={theme.text} />}
          title="Advanced Post Filtering"
          description="AI-powered content filtering and organization"
          theme={theme}
        />
        <FeatureItem
          icon={<Ionicons name="document-text" size={24} color={theme.text} />}
          title="Post Summaries"
          description="Quick summaries of long posts and threads"
          theme={theme}
        />
        <FeatureItem
          icon={<Ionicons name="color-palette" size={24} color={theme.text} />}
          title="Additional Themes"
          description="Customize your app with premium themes"
          theme={theme}
        />
      </View>

      <TouchableOpacity
        onPress={buyPro}
        activeOpacity={0.5}
        style={t(styles.upgradeButton, {
          backgroundColor: theme.buttonBg,
        })}
      >
        <View style={styles.upgradeButtonContent}>
          <Text
            style={t(styles.upgradeButtonText, {
              color: theme.buttonText,
            })}
          >
            {isLoadingOffering
              ? "Loading..."
              : isPro
                ? "Manage Subscription"
                : proOffering?.product.priceString
                  ? `Upgrade Now - ${proOffering.product.priceString}`
                  : "Upgrade to Pro"}
          </Text>
          {isLoadingOffering && (
            <ActivityIndicator
              size="small"
              color={theme.text}
              style={styles.buttonLoader}
            />
          )}
        </View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  proIcon: {
    height: 100,
    marginBottom: 15,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subheaderText: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  priceLoader: {
    marginTop: 8,
  },
  buttonLoader: {
    marginLeft: 8,
  },
  featuresContainer: {
    paddingHorizontal: 16,
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
  upgradeButton: {
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  upgradeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
  },
});
