import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import RedditURL from "../../utils/RedditURL";
import WikiPage from "../../pages/WikiPage";

type WikiScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function WikiScreen({ StackNavigator }: WikiScreenProps) {
  return (
    <StackNavigator.Screen<"WikiPage">
      name="WikiPage"
      component={WikiPage}
      options={({ route }) => ({
        title: new RedditURL(route.params.url).getPageName(),
      })}
    />
  );
}
