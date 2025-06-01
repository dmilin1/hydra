import { useContext } from "react";
import { Alert } from "react-native";
import { ThemeContext } from "../../../../../../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../../../../../../utils/navigation";

export function useSetTheme() {
  const { systemColorScheme, setCurrentTheme, cantUseTheme } =
    useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  return (
    themeKey: string,
    colorScheme: "light" | "dark" = systemColorScheme,
  ) => {
    setCurrentTheme(themeKey, colorScheme);

    if (!cantUseTheme(themeKey)) return;

    Alert.alert(
      "Hydra Pro Theme",
      colorScheme === systemColorScheme
        ? "You can use this theme for 5 minutes to try it out. Upgrade to Hydra Pro to keep using it."
        : `Upgrade to Hydra Pro to use this theme in ${colorScheme} mode.`,
      [
        {
          text: "Get Hydra Pro",
          isPreferred: true,
          onPress: () => pushURL("hydra://settings/hydraPro"),
        },
        { text: "Maybe Later", style: "cancel" },
      ],
    );
  };
}
