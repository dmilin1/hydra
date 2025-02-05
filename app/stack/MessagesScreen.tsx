import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import MessagesPage from "../../pages/MessagesPage";

type MessageScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function MessagesScreen({ StackNavigator }: MessageScreenProps) {
  return (
    <StackNavigator.Screen<"MessagesPage">
      name="MessagesPage"
      component={MessagesPage}
      options={{
        headerTitle: "Messages",
      }}
    />
  );
}
