import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StackParamsList } from "./index";
import AccountsPage from "../../pages/AccountsPage";
import IconButton from "../../components/RedditDataRepresentations/Navbar/IconButton";
import { Entypo } from "@expo/vector-icons";
import { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import Login from "../../components/Modals/Login";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type AccountsScreenProps = {
    StackNavigator: ReturnType<typeof createNativeStackNavigator<StackParamsList>>;
}

export default function AccountsScreen({ StackNavigator }: AccountsScreenProps) {
    const { theme } = useContext(ThemeContext);
    const { setModal } = useContext(ModalContext);

    return (
        <StackNavigator.Screen<'Accounts'>
            name="Accounts"
            component={AccountsPage}
            options={() => ({
                headerRight: () => (
                    <IconButton
                        icon={<Entypo name="plus" size={24} color={theme.buttonText} />}
                        onPress={() => setModal(<Login />)}
                        justifyContent="flex-end"
                    />)
                ,
                headerBackTitle: "Subreddits",
            })}
        />
    )
}