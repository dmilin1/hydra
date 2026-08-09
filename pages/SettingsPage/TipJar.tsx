import React, { ReactNode, useContext, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import {
  SubscriptionsContext,
  TipProductId,
} from "../../contexts/SubscriptionsContext";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import { Theme } from "../../constants/Themes";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import List from "../../components/UI/List";
import { openExternalLink } from "../../utils/openExternalLink";

const TIP_ICONS: Record<TipProductId, (theme: Theme) => ReactNode> = {
  "com.dmilin.hydra.tip.small": (theme: Theme) => (
    <FontAwesome5
      iconStyle="solid"
      name="coffee"
      size={19}
      color={theme.text}
    />
  ),
  "com.dmilin.hydra.tip.medium": (theme: Theme) => (
    <FontAwesome5
      iconStyle="solid"
      name="pizza-slice"
      size={19}
      color={theme.text}
    />
  ),
  "com.dmilin.hydra.tip.large": (theme: Theme) => (
    <FontAwesome5
      iconStyle="solid"
      name="hamburger"
      size={19}
      color={theme.text}
    />
  ),
  "com.dmilin.hydra.tip.huge": (theme: Theme) => (
    <FontAwesome5 iconStyle="solid" name="gift" size={19} color={theme.text} />
  ),
};

export default function TipJar() {
  const { theme } = useContext(ThemeContext);
  const { tipProducts, buyTip, isLoadingProductsAndOfferings } =
    useContext(SubscriptionsContext);

  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [hasTipped, setHasTipped] = useState(false);

  return (
    <>
      <View style={styles.headerContainer}>
        <FontAwesome6
          name="heart"
          style={styles.headerEmoji}
          color={theme.text}
        />
        <Text style={[styles.headerText, { color: theme.text }]}>Tip Jar</Text>
        <Text style={[styles.subheaderText, { color: theme.text }]}>
          Hydra is a labor of love maintained by a solo developer. Your
          contributions are what allow Hydra to exist. Thank you so much for
          using and supporting Hydra!
        </Text>
        {hasTipped ? (
          <Text style={[styles.thanksText, { color: theme.text }]}>
            Thank you so much for your support! ❤️
          </Text>
        ) : null}
      </View>
      {isLoadingProductsAndOfferings ? (
        <ActivityIndicator
          size="small"
          color={theme.subtleText}
          style={styles.loader}
        />
      ) : tipProducts ? (
        <>
          <List
            items={tipProducts.map((product) => ({
              key: product.identifier,
              text: product.title,
              icon: TIP_ICONS[product.identifier as TipProductId](theme),
              disabled: !!purchasingId,
              onPress: async () => {
                setPurchasingId(product.identifier);
                const purchased = await buyTip(product);
                if (purchased) {
                  setHasTipped(true);
                }
                setPurchasingId(null);
              },
              rightIcon: (
                <View
                  /**
                   * For some reason the activity indicator doesn't display
                   * properly without this key.
                   */
                  key={`${product.identifier}-${purchasingId}`}
                  style={[
                    styles.priceButton,
                    { backgroundColor: theme.buttonBg },
                  ]}
                >
                  {purchasingId === product.identifier ? (
                    <ActivityIndicator
                      style={styles.paymentLoader}
                      size="small"
                      color={theme.buttonText}
                    />
                  ) : (
                    <Text
                      style={[styles.priceText, { color: theme.buttonText }]}
                    >
                      {product.priceString}
                    </Text>
                  )}
                </View>
              ),
            }))}
          />
          <View style={styles.sponsorContainer}>
            <View style={styles.orContainer}>
              <View
                style={[styles.orHairline, { backgroundColor: theme.divider }]}
              />
              <Text style={[styles.orText, { color: theme.text }]}>or</Text>
              <View
                style={[styles.orHairline, { backgroundColor: theme.divider }]}
              />
            </View>
            <Touchable
              activeOpacity={0.5}
              onPress={() =>
                openExternalLink("https://github.com/sponsors/dmilin1")
              }
            >
              <Text
                style={[styles.sponsorText, { color: theme.iconOrTextButton }]}
              >
                Sponsor Hydra on GitHub
              </Text>
            </Touchable>
          </View>
        </>
      ) : (
        <Text style={[styles.errorText, { color: theme.subtleText }]}>
          Tips options couldn't be loaded. Please try again later.
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerEmoji: {
    fontSize: 60,
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
    textAlign: "center",
  },
  thanksText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    textAlign: "center",
  },
  loader: {
    marginTop: 20,
  },
  priceButton: {
    minWidth: 75,
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  paymentLoader: {
    marginVertical: -5,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
  },
  sponsorContainer: {
    gap: 20,
    alignItems: "center",
    marginTop: 20,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 200,
  },
  orHairline: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 10,
  },
  sponsorText: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 10,
  },
});
