import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import TextButton from "../../components/Navbar/TextButton";
import UserPage from "../../pages/UserPage";
import RedditURL from "../../utils/RedditURL";

type UserScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function UserScreen({ StackNavigator }: UserScreenProps) {
  return (
    <StackNavigator.Screen<"UserPage">
      name="UserPage"
      component={UserPage}
      options={({ route, navigation }) => ({
        headerLeft: () => {
          const depth = navigation.getState().routes.length;
          if (depth !== 1) return undefined;
          return (
            <TextButton
              text="Accounts"
              justifyContent="flex-start"
              onPress={() =>
                navigation.navigate("Accounts", { url: "hydra://accounts" })
              }
            />
          );
        },
        title: new RedditURL(route.params.url).getPageName(),
      })}
    />
  );
}
