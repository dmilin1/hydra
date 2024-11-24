import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";

import { StackParamsList } from "./index";
import SortAndContext from "../../components/RedditDataRepresentations/Navbar/SortAndContext";
import { SubredditContext } from "../../contexts/SubredditContext";
import PostsPage from "../../pages/PostsPage";
import RedditURL from "../../utils/RedditURL";

type PostsScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function PostsScreen({ StackNavigator }: PostsScreenProps) {
  const { subreddits } = useContext(SubredditContext);
  return (
    <StackNavigator.Screen<"PostsPage">
      name="PostsPage"
      component={PostsPage}
      options={({ route }) => ({
        title: new RedditURL(route.params.url).getSubreddit() ?? "Posts",
        headerRight: () => {
          const subreddit = new RedditURL(route.params.url).getSubreddit();
          return (
            <SortAndContext
              route={route}
              sortOptions={["Hot", "New", "Top", "Rising"]}
              contextOptions={[
                "New Post",
                subreddits.subscriber.find((sub) => sub.name === subreddit)
                  ? "Unsubscribe"
                  : "Subscribe",
                subreddits.favorites.find((sub) => sub.name === subreddit)
                  ? "Unfavorite"
                  : "Favorite",
                "Share",
              ]}
            />
          );
        },
      })}
    />
  );
}
