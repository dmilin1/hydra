import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";
import HydraProFeatureList from "../../UI/HydraProFeatureList";

export const HYDRA_PRO_LAST_OFFERED_KEY = "hydraProLastOfferedAt";

type GetHydraProProps = {
  onExit: () => void;
};

export default function GetHydraPro({ onExit }: GetHydraProProps) {
  const { theme } = useContext(ThemeContext);

  const exit = () => {
    KeyStore.set(HYDRA_PRO_LAST_OFFERED_KEY, Date.now());
    onExit();
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.tint, borderColor: theme.divider },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.exitButton,
                { backgroundColor: theme.verySubtleText },
              ]}
              onPress={exit}
            >
              <FontAwesome6 name="xmark" size={16} color={theme.subtleText} />
            </TouchableOpacity>

            <View style={styles.headerArea}>
              <Image
                source={require("../../../assets/images/HydraPro.png")}
                style={styles.proIcon}
                resizeMode="contain"
              />
            </View>

            <ScrollView>
              <Text style={[styles.title, { color: theme.text }]}>
                Hydra Pro
              </Text>
              <Text style={[styles.subtitle, { color: theme.subtleText }]}>
                Unlock the full potential of Hydra
              </Text>

              <View style={styles.features}>
                <Text style={[styles.featureItem, { color: theme.text }]}>
                  Hydra is a nights-and-weekends labor of love, not a paycheck.
                  Hydra Pro is a cheap subscription option that helps me keep
                  the lights on and gives you a few bells and whistles to
                  improve your experience.
                </Text>
              </View>

              <HydraProFeatureList invertColors={true} />
            </ScrollView>

            <GetHydraProButton onPress={exit} />
          </View>
        </View>
        <TouchableOpacity style={styles.background} onPress={exit} />
      </View>
    </>
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
    opacity: 0.7,
    zIndex: 1,
  },
  card: {
    zIndex: 2,
    maxWidth: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 16,
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
  proIcon: {
    height: 64,
    marginBottom: 6,
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
  features: {
    gap: 6,
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 14,
  },
  notNowButton: {
    marginTop: 10,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  notNowText: {
    fontWeight: "600",
    fontSize: 15,
  },
});
