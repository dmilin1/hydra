import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StackParamsList } from "./index";
import PostsPage from "../../pages/PostsPage";
import SortAndContext from "../../components/Navigation/Navbar/Components/SortAndContext";

type HomeScreenProps = {
    StackNavigator: ReturnType<typeof createNativeStackNavigator<StackParamsList>>;
}

export default function HomeScreen({ StackNavigator }: HomeScreenProps) {
    return (
        <StackNavigator.Screen<'Home'>
            name="Home"
            component={PostsPage}
            options={({ route }) => ({
                headerRight: () => {
                    return (
                        <SortAndContext
                            route={route}
                            sortOptions={["Best", "Hot", "New", "Top", "Rising"]}
                            contextOptions={["Share"]}
                        />)
                },
                headerBackTitle: "Subreddits",
            })}
        />
    )
}