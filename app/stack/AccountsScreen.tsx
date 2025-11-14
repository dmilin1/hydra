import { Entypo } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";

import { StackParamsList } from "./index";
import Login from "../../components/Modals/Login";
import IconButton from "../../components/Navbar/IconButton";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import AccountsPage from "../../pages/AccountsPage";

type AccountsScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function AccountsScreen({
  StackNavigator,
}: AccountsScreenProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  return (
    <StackNavigator.Screen<"Accounts">
      name="Accounts"
      component={AccountsPage}
      options={() => ({
        headerRight: () => (
          <IconButton
            icon={
              <Entypo name="plus" size={24} color={theme.iconOrTextButton} />
            }
            onPress={() => setModal(<Login />)}
            touchableOpacityProps={{
              accessibilityLabel: "Add account",
              accessibilityRole: "button",
            }}
          />
        ),
        headerBackTitle: "Subreddits",
      })}
    />
  );
}
