import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackParamsList } from "./index";
import GalleryPage from "../../pages/GalleryPage";
import RedditURL from "../../utils/RedditURL";

type GalleryScreenProps = {
  StackNavigator: ReturnType<
    typeof createNativeStackNavigator<StackParamsList>
  >;
};

export default function GalleryScreen({ StackNavigator }: GalleryScreenProps) {
  return (
    <StackNavigator.Screen<"GalleryPage">
      name="GalleryPage"
      component={GalleryPage}
      options={({ route }) => ({
        title: new RedditURL(route.params.url).getPageName(),
      })}
    />
  );
}
