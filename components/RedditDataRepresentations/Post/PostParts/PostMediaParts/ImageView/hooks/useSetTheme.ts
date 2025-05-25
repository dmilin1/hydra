import { useContext } from "react";
import { Alert } from "react-native";
import { ThemeContext } from "../../../../../../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../../../../../../utils/navigation";

const PRO_ALERT_TITLE = "Hydra Pro Theme";
const PRO_ALERT_MSG =
  "You can use this theme for 5 minutes to try it out. Upgrade to Hydra Pro to keep using it.";

export function useSetTheme() {
  const { setCurrentTheme, cantUseTheme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  return (themeKey: string) => {
    setCurrentTheme(themeKey);

    if (!cantUseTheme(themeKey)) return;

    Alert.alert(PRO_ALERT_TITLE, PRO_ALERT_MSG, [
      {
        text: "Get Hydra Pro",
        isPreferred: true,
        onPress: () => pushURL("hydra://settings/hydraPro"),
      },
      { text: "Maybe Later", style: "cancel" },
    ]);
  };
}
