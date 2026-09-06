import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import RedditURL from "../../utils/RedditURL";
import ChatPage from "../../pages/ChatPage";

type ChatScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function ChatScreen({ StackNavigator }: ChatScreenProps) {
  return (
    <StackNavigator.Screen<"ChatPage">
      name="ChatPage"
      component={ChatPage}
      options={({ route }) => ({
        title: new RedditURL(route.params.url).getPageName(),
      })}
    />
  );
}
