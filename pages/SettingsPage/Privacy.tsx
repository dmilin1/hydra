import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { ColorValue, StyleSheet, Switch, Text } from "react-native";
import { useMMKVBoolean } from "react-native-mmkv";

import List from "../../components/UI/List";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

export const ERROR_REPORTING_STORAGE_KEY = "allowErrorReporting";

export default function Privacy() {
  const { theme } = useContext(ThemeContext);

  const [allowErrorReporting, setAllowErrorReporting] = useMMKVBoolean(
    ERROR_REPORTING_STORAGE_KEY,
  );

  const toggleErrorReporting = () => {
    setAllowErrorReporting(!(allowErrorReporting ?? true));
    alert("Hydra must be restarted for this change to take effect.");
  };

  return (
    <>
      <List
        title="Error Reporting"
        items={[
          {
            key: "errorReporting",
            icon: <Ionicons name="bug-outline" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={allowErrorReporting !== false}
                onValueChange={() => toggleErrorReporting()}
              />
            ),
            text: "Allow Hydra to report errors",
            onPress: () => toggleErrorReporting(),
          },
        ]}
      />
      <Text
        style={t(styles.textDescription, {
          color: theme.text,
        })}
      >
        If Hydra encounters an error (e.g. a crash or loading issue), it will
        automatically upload an error log. This log includes a stack trace to
        pinpoint the issue, your Reddit username (if logged in), and device
        details like phone model and available RAM. These logs help keep Hydra
        bug free!
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
