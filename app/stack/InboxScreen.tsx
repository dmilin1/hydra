import { MaterialIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { Alert } from "react-native";

import { StackParamsList } from "./index";
import { markAllMessagesRead } from "../../api/Messages";
import IconButton from "../../components/Navbar/IconButton";
import { InboxContext } from "../../contexts/InboxContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import InboxPage from "../../pages/InboxPage";

type InboxScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function InboxScreen({ StackNavigator }: InboxScreenProps) {
  const { theme } = useContext(ThemeContext);
  const { checkForMessages } = useContext(InboxContext);

  return (
    <StackNavigator.Screen<"InboxPage">
      name="InboxPage"
      component={InboxPage}
      options={{
        headerTitle: "Inbox",
        headerRight: () => (
          <IconButton
            icon={
              <MaterialIcons
                name="checklist-rtl"
                size={24}
                color={theme.buttonText}
              />
            }
            onPress={() => {
              Alert.alert("Mark All Items Read?", undefined, [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Ok",
                  style: "default",
                  onPress: async () => {
                    try {
                      await markAllMessagesRead();
                      Alert.alert(
                        "Success!",
                        "This may take a moment to update, especially if you have a lot of unread messages.",
                      );
                      setTimeout(() => checkForMessages(), 1000);
                    } catch (_e) {
                      Alert.alert(
                        "Error",
                        "Failed to mark all messages as read.",
                      );
                    }
                  },
                },
              ]);
            }}
            justifyContent="flex-end"
          />
        ),
      }}
    />
  );
}
