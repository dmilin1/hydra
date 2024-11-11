import { useContext } from "react";

import { HistoryContext } from "../../../../contexts/HistoryContext";
import { SubredditContext } from "../../../../contexts/SubredditContext";
import RedditURL from "../../../../utils/RedditURL";
import DirectionButton from "../Components/DirectionButton";
import SortAndContext from "../Components/SortAndContext";
import TextButton from "../Components/TextButton";

export default function Subreddit() {
  const history = useContext(HistoryContext);
  const { subreddits } = useContext(SubredditContext);

  const currentPath = history.past.slice(-1)[0]?.elem.props.url;
  const subreddit = new RedditURL(currentPath).getSubreddit();

  return (
    <>
      <DirectionButton direction="backward" />
      <TextButton text={subreddit} />
      <SortAndContext
        sortOptions={["Hot", "New", "Top", "Rising"]}
        contextOptions={[
          "New Post",
          subreddits.subscriber.find((sub) => sub.name === subreddit)
            ? "Unsubscribe"
            : "Subscribe",
          subreddits.favorites.find((sub) => sub.name === subreddit)
            ? "Unfavorite"
            : "Favorite",
          "Share",
        ]}
      />
    </>
  );
}
