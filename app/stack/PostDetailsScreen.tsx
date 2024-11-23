import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StackParamsList } from "./index";
import SortAndContext from "../../components/Navigation/Navbar/Components/SortAndContext";
import PostDetails from "../../pages/PostDetails";

type PostDetailsScreenProps = {
    StackNavigator: ReturnType<typeof createNativeStackNavigator<StackParamsList>>;
}

export default function PostDetailsScreen({ StackNavigator }: PostDetailsScreenProps) {
    return (
        <StackNavigator.Screen<'PostDetailsPage'>
            name="PostDetailsPage"
            component={PostDetails}
            options={({ route }) => ({
                headerRight: () => {
                    return (
                        <SortAndContext
                            route={route}
                            sortOptions={["Best", "New", "Top", "Controversial", "Old", "Q&A"]}
                            contextOptions={["Share"]}
                        />)
                },
            })}
        />
    )
}