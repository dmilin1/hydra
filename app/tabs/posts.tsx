import React from "react";

import HistoryStack from "../../components/Navigation/HistoryStack";
import PostsPage from "../../pages/PostsPage";
import Subreddits from "../../pages/Subreddits";

export default function Posts() {
  return (
    <HistoryStack
      initialPast={[
        {
          elem: <Subreddits />,
          name: "Subreddits",
        },
        {
          elem: <PostsPage url="https://www.reddit.com/best" />,
          name: "Home",
        },
      ]}
    />
  );
}
