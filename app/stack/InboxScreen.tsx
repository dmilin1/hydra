import MaterialIcons from "@react-native-vector-icons/material-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { Alert, View } from "react-native";

import { StackParamsList } from "./index";
import { markAllInboxItemsRead } from "../../api/gql/Inbox";
import IconButton from "../../components/Navbar/IconButton";
import { InboxContext } from "../../contexts/InboxContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import InboxPage from "../../pages/InboxPage";
import { ToastContext } from "../../contexts/ToastContext";
import { oneTimeAlert } from "../../utils/oneTimeAlert";
import Ionicons from "@react-native-vector-icons/ionicons";
import { AccountContext } from "../../contexts/AccountContext";

type InboxScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function InboxScreen({ StackNavigator }: InboxScreenProps) {
  const { theme } = useContext(ThemeContext);
  const { markedAllRead } = useContext(InboxContext);
  const { showToast } = useContext(ToastContext);
  const { currentUser } = useContext(AccountContext);

  const markAllItemsRead = async () => {
    try {
      await markAllInboxItemsRead();
      markedAllRead();
      showToast({ title: "Marked all items as read" });
    } catch (_e) {
      Alert.alert("Error", "Failed to mark all items as read.");
    }
  };

  return (
    <StackNavigator.Screen<"InboxPage">
      name="InboxPage"
      component={InboxPage}
      options={({ navigation }) => ({
        headerTitle: "Inbox",
        headerRight: () => (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <IconButton
              icon={
                <Ionicons
                  name="chatbox-outline"
                  size={22}
                  color={theme.iconOrTextButton}
                />
              }
              onPress={() => {
                if (!currentUser) {
                  Alert.alert("You need to be logged in.");
                  return;
                }
                navigation.push("ChatPage", {
                  url: "https://www.reddit.com/chat",
                });
              }}
              touchableOpacityProps={{
                accessibilityLabel: "Open chat",
                accessibilityRole: "button",
              }}
            />
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
                accessibilityLabel: "Mark all items as read",
                accessibilityRole: "button",
              }}
            />
          </View>
        ),
      })}
    />
  );
}
