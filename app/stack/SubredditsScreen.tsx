import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import Subreddits from "../../pages/Subreddits";

type SubredditsScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function SubredditsScreen({
  StackNavigator,
}: SubredditsScreenProps) {
  return (
    <StackNavigator.Screen
      name="Subreddits"
      component={Subreddits}
      options={{
        title: "Subreddits",
      }}
    />
  );
}
