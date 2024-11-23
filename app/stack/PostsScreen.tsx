import { TypedNavigator } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StackParamsList } from "./index";
import PostsPage from "../../pages/PostsPage";
import SortAndContext from "../../components/Navigation/Navbar/Components/SortAndContext";
import { useContext } from "react";
import { SubredditContext } from "../../contexts/SubredditContext";
import RedditURL from "../../utils/RedditURL";

type PostsScreenProps = {
    StackNavigator: ReturnType<typeof createNativeStackNavigator<StackParamsList>>;
}

export default function PostsScreen({ StackNavigator }: PostsScreenProps) {
    const { subreddits } = useContext(SubredditContext);
    return (
        <StackNavigator.Screen<'PostsPage'>
            name="PostsPage"
            component={PostsPage}
            options={({ route }) => ({
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
                        />)
                },
            })}
        />
    )
}