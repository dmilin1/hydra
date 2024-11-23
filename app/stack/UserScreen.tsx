import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StackParamsList } from "./index";
import SortAndContext from "../../components/Navigation/Navbar/Components/SortAndContext";
import UserPage from "../../pages/UserPage";
import { useContext } from "react";
import { AccountContext } from "../../contexts/AccountContext";
import URL from "../../utils/URL";
import TextButton from "../../components/Navigation/Navbar/Components/TextButton";

type UserScreenProps = {
    StackNavigator: ReturnType<typeof createNativeStackNavigator<StackParamsList>>;
}

export default function UserScreen({ StackNavigator }: UserScreenProps) {
    const { currentUser } = useContext(AccountContext);

    return (
        <StackNavigator.Screen<'UserPage'>
            name="UserPage"
            component={UserPage}
            options={({ route, navigation }) => ({
                headerLeft: () => {
                    const depth = navigation.getState().routes.length;
                    if (depth !== 1) return undefined;
                    return (
                        <TextButton
                            text="Accounts"
                            justifyContent="flex-start"
                            onPress={() => navigation.navigate("Accounts", { url: "hydra://accounts" })}
                        />)
                },
                title: route.params.url.split("/")[4] ?? 'User',
                headerRight: () => {
                    const url = route.params.url;
                    const section = new URL(url).getRelativePath().split("/")[3];
                    return (
                        <SortAndContext
                            route={route}
                            sortOptions={
                                section === "submitted" || section === "comments"
                                    ? ["New", "Hot", "Top"]
                                    : undefined
                            }
                            contextOptions={["Share"]}
                        />)
                },
            })}
        />
    )
}