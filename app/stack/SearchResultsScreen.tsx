import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import SearchResultsPage from "../../pages/SearchResultsPage";

type SearchResultsScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function SearchResultsScreen({
  StackNavigator,
}: SearchResultsScreenProps) {
  return (
    <StackNavigator.Screen<"SearchResultsPage">
      name="SearchResultsPage"
      component={SearchResultsPage}
      options={{
        title: "Search",
      }}
    />
  );
}
