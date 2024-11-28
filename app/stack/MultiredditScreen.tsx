import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import SortAndContext from "../../components/Navbar/SortAndContext";
import PostsPage from "../../pages/PostsPage";
import RedditURL from "../../utils/RedditURL";

type MultiredditScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function MultiredditScreen({
  StackNavigator,
}: MultiredditScreenProps) {
  return (
    <StackNavigator.Screen<"MultiredditPage">
      name="MultiredditPage"
      component={PostsPage}
      options={({ route, navigation }) => ({
        title: new RedditURL(route.params.url).getPageName(),
        headerRight: () => {
          return (
            <SortAndContext
              route={route}
              navigation={navigation}
              sortOptions={["Hot", "New", "Top", "Rising", "Controversial"]}
              contextOptions={["Share"]}
            />
          );
        },
      })}
    />
  );
}
