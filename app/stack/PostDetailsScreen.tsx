import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import SortAndContext, {
  ContextTypes,
  SortTypes,
} from "../../components/Navbar/SortAndContext";
import PostDetails from "../../pages/PostDetails";
import RedditURL from "../../utils/RedditURL";

type PostDetailsScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export const PostDetailsScreenContextOptions: ContextTypes[] = ["Share"];

export const PostDetailsScreenSortOptions: SortTypes[] = [
  "Best",
  "New",
  "Top",
  "Controversial",
  "Old",
  "Q&A",
];

export default function PostDetailsScreen({
  StackNavigator,
}: PostDetailsScreenProps) {
  return (
    <StackNavigator.Screen<"PostDetailsPage">
      name="PostDetailsPage"
      component={PostDetails}
      options={({ route, navigation }) => ({
        title: new RedditURL(route.params.url).getPageName(),
        headerRight: () => {
          return (
            <SortAndContext
              route={route}
              navigation={navigation}
              sortOptions={PostDetailsScreenSortOptions}
              contextOptions={PostDetailsScreenContextOptions}
            />
          );
        },
      })}
    />
  );
}
