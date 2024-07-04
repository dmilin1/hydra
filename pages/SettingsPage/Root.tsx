import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as Application from "expo-application";
import * as Updates from "expo-updates";
import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

import List from "../../components/UI/List";
import { HistoryFunctionsContext } from "../../contexts/HistoryContext";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

export default function Root() {
  const { theme } = useContext(ThemeContext);
  const history = useContext(HistoryFunctionsContext);

  return (
    <>
      <List
        title="General"
        items={[
          {
            key: "theme",
            icon: <Feather name="moon" size={24} color={theme.text} />,
            text: "Theme",
            onPress: () => history.pushPath("hydra://settings/theme"),
          },
          {
            key: "account",
            icon: <FontAwesome5 name="user" size={24} color={theme.text} />,
            text: "Account",
            onPress: () => history.pushPath("hydra://accounts"),
          },
          {
            key: "dataUse",
            icon: <Feather name="activity" size={24} color={theme.text} />,
            text: "Data Use",
            onPress: () => history.pushPath("hydra://settings/dataUse"),
          },
          {
            key: "requestFeature",
            icon: (
              <Feather name="git-pull-request" size={24} color={theme.text} />
            ),
            text: "Request A Feature",
            onPress: () => history.pushPath("/r/HydraFeatureRequests/top"),
          },
        ]}
      />
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
});
