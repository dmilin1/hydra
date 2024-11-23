import React from "react";

import HistoryStack from "../stack";
import PostsPage from "../../pages/PostsPage";
import Subreddits from "../../pages/Subreddits";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

type PageParams = {
  url: string;
}

type PageParamsList = {
  PostsPage: PageParams;
  Subreddits: PageParams;
}

export default () => HistoryStack({
  initialParams: {
    Home: {
      url: "https://www.reddit.com/",
    },
  },
});