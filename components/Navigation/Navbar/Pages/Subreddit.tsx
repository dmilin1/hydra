import { FontAwesome } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../../../../utils/RedditURL";

import { HistoryContext } from "../../../../contexts/HistoryContext";
import DirectionButton from "../Components/DirectionButton";
import SortAndContext from "../Components/SortAndContext";
import TextButton from "../Components/TextButton";
import { FavoritesContext } from "../../../../contexts/FavoritesContext";

export default function Subreddit() {
  const history = useContext(HistoryContext);
  const { theme } = useContext(ThemeContext);
  const { favorites, toggleFavorite } = useContext(FavoritesContext);
  const [isFavorite, setIsFavorite] = useState(false);

  const currentSubreddit = history.past.slice(-1)[0]?.name;

  useEffect(() => {
    setIsFavorite(favorites.includes(currentSubreddit));
  }, [currentSubreddit, favorites]);

  const handleFavorite = async () => {
    const newIsFavorite = await toggleFavorite(currentSubreddit);
    setIsFavorite(newIsFavorite);
  };

  return (
    <>
      <DirectionButton direction="backward" />
      <TextButton text={currentSubreddit} />
      <TouchableOpacity onPress={handleFavorite}>
        <FontAwesome
          name={isFavorite ? "star" : "star-o"}
          size={24}
          color={theme.iconPrimary}
          style={{ marginRight: 15 }}
        />
      </TouchableOpacity>
      <SortAndContext
        sortOptions={["Hot", "New", "Top", "Rising"]}
        contextOptions={["New Post", "Share"]}
      />
    </>
  );
}
