import MaterialIcons from "@react-native-vector-icons/material-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { Alert } from "react-native";

import { StackParamsList } from "./index";
import { markAllMessagesRead } from "../../api/Messages";
import IconButton from "../../components/Navbar/IconButton";
import { InboxContext } from "../../contexts/InboxContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import InboxPage from "../../pages/InboxPage";
import { ToastContext } from "../../contexts/ToastContext";
import { oneTimeAlert } from "../../utils/oneTimeAlert";

type InboxScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function InboxScreen({ StackNavigator }: InboxScreenProps) {
  const { theme } = useContext(ThemeContext);
  const { checkForMessages } = useContext(InboxContext);
  const { showToast } = useContext(ToastContext);

  const markAllItemsRead = async () => {
    try {
      await markAllMessagesRead();
      showToast({
        title: "Marking all messages as read",
        body: "This may take a moment to update...",
      });
      setTimeout(() => checkForMessages(), 1000);
    } catch (_e) {
      Alert.alert("Error", "Failed to mark all messages as read.");
    }
  };

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
                color={theme.iconOrTextButton}
              />
            }
            onPress={() => {
              const didShow = oneTimeAlert(
                "mark-all-items-read",
                "Mark All Items Read?",
                undefined,
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Ok",
                    style: "default",
                    onPress: markAllItemsRead,
                  },
                ],
              );
              if (!didShow) markAllItemsRead();
            }}
            touchableOpacityProps={{
              accessibilityLabel: "Mark all messages as read",
              accessibilityRole: "button",
            }}
          />
        ),
      }}
    />
  );
}
