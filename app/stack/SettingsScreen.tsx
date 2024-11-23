import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StackParamsList } from "./index";
import SortAndContext from "../../components/Navigation/Navbar/Components/SortAndContext";
import SettingsPage from "../../pages/SettingsPage";

type SettingsScreenProps = {
    StackNavigator: ReturnType<typeof createNativeStackNavigator<StackParamsList>>;
}

export default function SettingsScreen({ StackNavigator }: SettingsScreenProps) {
    return (
        <StackNavigator.Screen<'SettingsPage'>
            name="SettingsPage"
            component={SettingsPage}
            options={{
                headerTitle: 'Settings',
            }}
        />
    )
}