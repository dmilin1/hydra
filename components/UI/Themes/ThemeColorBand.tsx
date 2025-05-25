import { View, StyleSheet } from "react-native";
import { Theme } from "../../../constants/Themes";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { useContext } from "react";
import { validateHex } from "../../../utils/colors";

type ThemeColorBandProps = {
  theme: Theme;
};

export default function ThemeColorBand({ theme }: ThemeColorBandProps) {
  const { theme: currentTheme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.colorsContainer,
        {
          borderColor: currentTheme.divider,
        },
      ]}
    >
      {Object.entries(theme)
        .filter(([_, val]) => validateHex(val))
        .map(([key, color]: [string, any]) => (
          <View
            key={key}
            style={{
              backgroundColor: color,
              flex: 1,
              height: 20,
            }}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  colorsContainer: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    height: 20,
  },
});
