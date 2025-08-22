import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import PostsPage from "../../pages/PostsPage";

type HomeScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function HomeScreen({ StackNavigator }: HomeScreenProps) {
  return (
    <StackNavigator.Screen<"Home">
      name="Home"
      component={PostsPage}
      options={{
        headerBackTitle: "Subreddits",
        freezeOnBlur: true,
      }}
    />
  );
}
