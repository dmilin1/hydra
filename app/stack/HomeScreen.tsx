import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import SortAndContext from "../../components/Navbar/SortAndContext";
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
      options={({ route, navigation }) => ({
        headerRight: () => {
          return (
            <SortAndContext
              route={route}
              navigation={navigation}
              sortOptions={["Best", "Hot", "New", "Top", "Rising"]}
              contextOptions={["Share"]}
            />
          );
        },
        headerBackTitle: "Subreddits",
        freezeOnBlur: true,
      })}
    />
  );
}
