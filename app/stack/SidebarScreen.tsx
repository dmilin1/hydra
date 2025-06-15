import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import RedditURL from "../../utils/RedditURL";
import SidebarPage from "../../pages/SidebarPage";

type SidebarScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function SidebarScreen({ StackNavigator }: SidebarScreenProps) {
  return (
    <StackNavigator.Screen<"SidebarPage">
      name="SidebarPage"
      component={SidebarPage}
      options={({ route }) => ({
        title: new RedditURL(route.params.url).getPageName(),
      })}
    />
  );
}
