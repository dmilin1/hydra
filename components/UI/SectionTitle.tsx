import { useContext } from "react";
import { StyleSheet, Text } from "react-native";

import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

export default function SectionTitle({ text }: { text: string }) {
  const { theme } = useContext(ThemeContext);

  return (
    <Text
      style={t(styles.title, {
        color: theme.subtleText,
      })}
    >
      {text.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 15,
    marginBottom: 10,
    marginHorizontal: 25,
    fontSize: 14,
  },
});
