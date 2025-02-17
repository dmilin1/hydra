import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import WebviewPage from "../../pages/WebviewPage";
import RedditURL from "../../utils/RedditURL";

type WebviewScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function WebviewScreen({ StackNavigator }: WebviewScreenProps) {
  return (
    <StackNavigator.Screen<"WebviewPage">
      name="WebviewPage"
      component={WebviewPage}
      options={({ route }) => ({
        title: new RedditURL(route.params.url).getPageName(),
      })}
    />
  );
}
