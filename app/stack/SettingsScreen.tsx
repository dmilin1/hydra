import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import SettingsPage from "../../pages/SettingsPage";
import RedditURL from "../../utils/RedditURL";

type SettingsScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function SettingsScreen({
  StackNavigator,
}: SettingsScreenProps) {
  return (
    <StackNavigator.Screen<"SettingsPage">
      name="SettingsPage"
      component={SettingsPage}
      options={({ route }) => ({
        title: new RedditURL(route.params.url).getPageName(),
      })}
    />
  );
}
