import {
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Application from "expo-application";
import * as Updates from "expo-updates";
import React, { useContext } from "react";
import { StyleSheet, Text, Image, TouchableOpacity, View } from "react-native";

import List from "../../components/UI/List";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../utils/navigation";

export default function Root() {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  return (
    <>
      <List
        title="Settings"
        items={[
          {
            key: "general",
            icon: <Feather name="settings" size={24} color={theme.text} />,
            text: "General",
            onPress: () => pushURL("hydra://settings/general"),
          },
          {
            key: "theme",
            icon: <Feather name="moon" size={24} color={theme.text} />,
            text: "Theme",
            onPress: () => pushURL("hydra://settings/theme"),
          },
          {
            key: "appearance",
            icon: <Feather name="eye" size={24} color={theme.text} />,
            text: "Appearance",
            onPress: () => pushURL("hydra://settings/appearance"),
          },
          {
            key: "account",
            icon: <FontAwesome5 name="user" size={24} color={theme.text} />,
            text: "Account",
            onPress: () => pushURL("hydra://accounts"),
          },
          {
            key: "dataUse",
            icon: <Feather name="activity" size={24} color={theme.text} />,
            text: "Data Use",
            onPress: () => pushURL("hydra://settings/dataUse"),
          },
          {
            key: "privacy",
            icon: <Feather name="lock" size={24} color={theme.text} />,
            text: "Privacy",
            onPress: () => pushURL("hydra://settings/privacy"),
          },
          {
            key: "advanced",
            icon: <FontAwesome name="wrench" size={24} color={theme.text} />,
            text: "Advanced",
            onPress: () => pushURL("hydra://settings/advanced"),
          },
          {
            key: "requestFeature",
            icon: (
              <Feather name="git-pull-request" size={24} color={theme.text} />
            ),
            text: "Request A Feature",
            onPress: () => pushURL("/r/HydraFeatureRequests/top?t=all"),
          },
        ]}
      />
      <TouchableOpacity
        onPress={() => pushURL("hydra://settings/hydraPro")}
        activeOpacity={0.5}
        style={t(styles.buyProButton, {
          backgroundColor: theme.buttonBg,
        })}
      >
        <View style={styles.buyProButtonSubContainer}>
          <View style={styles.buyProButtonIcon}>
            <Image
              source={require("./../../assets/images/icon.png")}
              style={styles.buyProButtonIconImage}
            />
          </View>
          <Text
            style={t(styles.buyProButtonText, {
              color: theme.buttonText,
            })}
          >
            Hydra Pro
          </Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={30}
            color={theme.buttonText}
            style={styles.buyProButtonIcon}
          />
        </View>
      </TouchableOpacity>
      <View style={styles.appDetails}>
        <Text
          style={t(styles.appDetailsText, {
            color: theme.text,
          })}
        >
          {Application.applicationName}: {Application.nativeApplicationVersion}
          {"\n"}
          Build #{Application.nativeBuildVersion}
          {"\n"}
          Update Group:{" "}
          {(Updates.manifest as any)?.metadata?.updateGroup ?? "development"}
          {"\n"}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  appDetails: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    textAlign: "center",
    marginVertical: 25,
    marginHorizontal: 15,
  },
  appDetailsText: {
    flex: 1,
    textAlign: "center",
  },
  buyProButton: {
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 15,
  },
  buyProButtonSubContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buyProButtonText: {
    fontSize: 20,
    marginLeft: 10,
  },
  buyProButtonIcon: {
    marginVertical: -100,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buyProButtonIconImage: {
    width: 30,
    height: 30,
    borderRadius: 5,
  },
});
