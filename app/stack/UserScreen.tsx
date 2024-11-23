import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import SortAndContext from "../../components/RedditDataRepresentations/Navbar/SortAndContext";
import TextButton from "../../components/RedditDataRepresentations/Navbar/TextButton";
import UserPage from "../../pages/UserPage";
import URL from "../../utils/URL";

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
        title: route.params.url.split("/")[4] ?? "User",
        headerRight: () => {
          const url = route.params.url;
          const section = new URL(url).getRelativePath().split("/")[3];
          return (
            <SortAndContext
              route={route}
              sortOptions={
                section === "submitted" || section === "comments"
                  ? ["New", "Hot", "Top"]
                  : undefined
              }
              contextOptions={["Share"]}
            />
          );
        },
      })}
    />
  );
}
