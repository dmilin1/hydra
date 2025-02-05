import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import InboxPage from "../../pages/InboxPage";

type InboxScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function InboxScreen({ StackNavigator }: InboxScreenProps) {
  return (
    <StackNavigator.Screen<"InboxPage">
      name="InboxPage"
      component={InboxPage}
      options={{
        headerTitle: "Inbox",
      }}
    />
  );
}
