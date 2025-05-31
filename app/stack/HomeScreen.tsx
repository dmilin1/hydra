import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import SortAndContext from "../../components/Navbar/SortAndContext";
import PostsPage from "../../pages/PostsPage";
import { FiltersContext } from "../../contexts/SettingsContexts/FiltersContext";
import { useContext } from "react";

type HomeScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function HomeScreen({ StackNavigator }: HomeScreenProps) {
  const { getHideSeenURLStatus } = useContext(FiltersContext);
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
              contextOptions={[
                getHideSeenURLStatus(route.params.url)
                  ? "Show Seen Posts"
                  : "Hide Seen Posts",
                "Share",
              ]}
            />
          );
        },
        headerBackTitle: "Subreddits",
        freezeOnBlur: true,
      })}
    />
  );
}
