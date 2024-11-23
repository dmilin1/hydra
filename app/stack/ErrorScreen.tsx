import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StackParamsList } from "./index";
import SortAndContext from "../../components/Navigation/Navbar/Components/SortAndContext";
import ErrorPage from "../../pages/ErrorPage";

type ErrorScreenProps = {
    StackNavigator: ReturnType<typeof createNativeStackNavigator<StackParamsList>>;
}

export default function ErrorScreen({ StackNavigator }: ErrorScreenProps) {
    return (
        <StackNavigator.Screen<'ErrorPage'>
            name="ErrorPage"
            component={ErrorPage}
        />
    )
}