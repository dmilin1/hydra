import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import SubredditSearchPage from "../../pages/SubredditSearchPage";

type SubredditSearchScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function SubredditSearchScreen({
  StackNavigator,
}: SubredditSearchScreenProps) {
  return (
    <StackNavigator.Screen<"SubredditSearchPage">
      name="SubredditSearchPage"
      component={SubredditSearchPage}
      options={{
        title: "Search",
      }}
    />
  );
}
