import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { ColorValue, StyleSheet, Switch, Text } from "react-native";

import List from "../../components/UI/List";
import { HistoryContext } from "../../contexts/HistoryContext";
import { DataModeContext } from "../../contexts/SettingsContexts/DataModeContext";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

export default function DataUse() {
  const { theme } = useContext(ThemeContext);
  const history = useContext(HistoryContext);
  const { dataModeSettings, changeDataModeSetting } =
    useContext(DataModeContext);

  return (
    <>
      <List
        title="Data Use"
        items={[
          {
            key: "wifi",
            icon: <Feather name="wifi" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={dataModeSettings.wifi === "lowData"}
                onValueChange={(value) =>
                  changeDataModeSetting("wifi", value ? "lowData" : "normal")
                }
              />
            ),
            text: "Use Low Data on Wi-Fi",
            onPress: () => history.pushPath("hydra://settings/theme"),
          },
          {
            key: "cellular",
            icon: <Ionicons name="cellular" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={dataModeSettings.cellular === "lowData"}
                onValueChange={(value) =>
                  changeDataModeSetting(
                    "cellular",
                    value ? "lowData" : "normal",
                  )
                }
              />
            ),
            text: "Use Low Data on Cellular",
            onPress: () => history.pushPath("hydra://accounts"),
          },
        ]}
      />
      <Text
        style={t(styles.textDescription, {
          color: theme.text,
        })}
      >
        Low data mode reduces the quality and amount of media that gets loaded
        when scrolling. For example, videos will not be loaded while scrolling
        and will only load when they are clicked on.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  textDescription: {
    margin: 15,
    lineHeight: 20,
  },
});
