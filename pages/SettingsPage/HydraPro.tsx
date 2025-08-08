import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";
import Time from "../../utils/Time";
import HydraProFeatureList from "../../components/UI/HydraProFeatureList";

export default function HydraPro() {
  const { theme } = useContext(ThemeContext);
  const {
    isPro,
    buyPro,
    proOffering,
    isLoadingOffering,
    purchasesInitialized,
    inGracePeriod,
    gracePeriodEndsAt,
    getCustomerInfo,
  } = useContext(SubscriptionsContext);

  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    getCustomerInfo(true);
  }, []);

  return (
    <>
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/images/HydraPro.png")}
          style={styles.proIcon}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.headerText,
            {
              color: theme.text,
            },
          ]}
        >
          Hydra Pro
        </Text>
        <Text
          style={[
            styles.subheaderText,
            {
              color: theme.text,
            },
          ]}
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
              style={[
                styles.priceText,
                {
                  color: theme.subtleText,
                },
              ]}
            >
              {proOffering.product.priceString} per month
            </Text>
          )
        )}
      </View>

      <View style={styles.featuresContainer}>
        <HydraProFeatureList />
      </View>

      <TouchableOpacity
        onPress={async () => {
          setIsPurchasing(true);
          await buyPro();
          setIsPurchasing(false);
        }}
        activeOpacity={0.5}
        style={[
          styles.upgradeButton,
          {
            backgroundColor: theme.buttonBg,
          },
        ]}
        disabled={isLoadingOffering || !purchasesInitialized}
      >
        <View style={styles.upgradeButtonContent}>
          <Text
            style={[
              styles.upgradeButtonText,
              {
                color: theme.buttonText,
              },
            ]}
          >
            {isLoadingOffering || !purchasesInitialized || isPurchasing ? (
              <ActivityIndicator size="small" color={theme.buttonText} />
            ) : inGracePeriod ? (
              "Renew Subscription"
            ) : isPro ? (
              "Manage Subscription"
            ) : proOffering?.product.priceString ? (
              `Upgrade Now - ${proOffering.product.priceString}`
            ) : (
              "Upgrade to Pro"
            )}
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
      {gracePeriodEndsAt && (
        <Text style={[styles.gracePeriodText, { color: theme.text }]}>
          Your subscription will end in{" "}
          {new Time(gracePeriodEndsAt).prettyTimeSince()}
        </Text>
      )}
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
  gracePeriodText: {
    fontSize: 14,
    marginTop: 4,
    marginHorizontal: 20,
    marginBottom: 20,
    textAlign: "center",
  },
});
