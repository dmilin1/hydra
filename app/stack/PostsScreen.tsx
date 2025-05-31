import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";

import { StackParamsList } from "./index";
import SortAndContext from "../../components/Navbar/SortAndContext";
import { SubredditContext } from "../../contexts/SubredditContext";
import PostsPage from "../../pages/PostsPage";
import RedditURL from "../../utils/RedditURL";
import { FiltersContext } from "../../contexts/SettingsContexts/FiltersContext";

type PostsScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function PostsScreen({ StackNavigator }: PostsScreenProps) {
  const { subreddits } = useContext(SubredditContext);
  const { getHideSeenURLStatus } = useContext(FiltersContext);
  return (
    <StackNavigator.Screen<"PostsPage">
      name="PostsPage"
      component={PostsPage}
      options={({ route, navigation }) => ({
        title: new RedditURL(route.params.url).getPageName(),
        headerRight: () => {
          const subreddit = new RedditURL(route.params.url).getSubreddit();
          return (
            <SortAndContext
              route={route}
              navigation={navigation}
              sortOptions={["Best", "Hot", "New", "Top", "Rising"]}
              contextOptions={[
                "New Post",
                subreddits.subscriber.find((sub) => sub.name === subreddit)
                  ? "Unsubscribe"
                  : "Subscribe",
                subreddits.favorites.find((sub) => sub.name === subreddit)
                  ? "Unfavorite"
                  : "Favorite",
                "Add to Multireddit",
                getHideSeenURLStatus(route.params.url)
                  ? "Show Seen Posts"
                  : "Hide Seen Posts",
                "Share",
              ]}
            />
          );
        },
      })}
    />
  );
}
