import { createContext, useContext, useEffect, useState } from "react";

import {
  Subreddit,
  Subreddits as SubredditsObj,
  getSubreddits,
  getTrending,
  setSubscriptionStatus,
} from "../api/Subreddits";
import { AccountContext } from "./AccountContext";
import AsyncStorage from "@react-native-async-storage/async-storage";


type SubredditContextType = {
  subreddits: SubredditsObj;
  subscribe: (subreddit: string) => void;
  unsubscribe: (subreddit: string) => void;
  toggleFavorite: (subreddit: string) => void;
};

const initialAccountContext: SubredditContextType = {
  subreddits: {
    favorites: [],
    moderator: [],
    subscriber: [],
    trending: [],
  },
  subscribe: () => {},
  unsubscribe: () => {},
  toggleFavorite: () => {},
};

export const SubredditContext = createContext(initialAccountContext);

export class NeedsLoginToFavorite extends Error {
  constructor() {
    super("You must be logged in to favorite subreddits");
  }
}

export class NeedsSubscriptionToFavorite extends Error {
  constructor() {
    super("You must be subscribed to a subreddit to favorite it");
  }
}

export function SubredditProvider({ children }: React.PropsWithChildren) {
  const { currentUser } = useContext(AccountContext);

  const [subreddits, setSubreddits] = useState(initialAccountContext.subreddits);

  const getStorageKey = () => {
    if (!currentUser) {
      alert('You must be logged in to favorite subreddits');
      throw new NeedsLoginToFavorite;
    }
    return `favoriteSubreddits:${currentUser.id}`;
  };

  const getFavoriteSubNames = async (): Promise<string[]> => {
    const favs = await AsyncStorage.getItem(getStorageKey());
    return favs ? JSON.parse(favs) : [];
  };

  const toggleFavorite = async (subredditName: string): Promise<void> => {
    try {
      const subToFavorite = subreddits.subscriber.find(sub => sub.name === subredditName);
      if (!subToFavorite) {
        throw new NeedsSubscriptionToFavorite();
      }

      const currentFavorites = await getFavoriteSubNames();
      const isFavorite = currentFavorites.includes(subredditName);

      let newFavorites: string[];
      let newFavoriteSubs: Subreddit[];
      if (isFavorite) {
        newFavorites = currentFavorites.filter(name => name !== subredditName);
        newFavoriteSubs = subreddits.favorites.filter(fav => fav.name !== subredditName);
      } else {
        newFavorites = [...currentFavorites, subredditName];
        newFavoriteSubs = [...subreddits.favorites, subToFavorite];
      }

      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(newFavorites));
      setSubreddits({
        ...subreddits,
        favorites: newFavoriteSubs,
      });
    } catch (e) {
      if (e instanceof NeedsLoginToFavorite) {
        return;
      }
      throw e;
    }
  };

  const loadSubreddits = async () => {
    if (currentUser) {
      const favoriteSubNames = await getFavoriteSubNames();
      const subreddits = await getSubreddits();
      const favorites = subreddits.subscriber.filter((sub) =>
        favoriteSubNames.includes(sub.name)
      );
      setSubreddits({
        ...subreddits,
        favorites,
      });
    } else {
      setSubreddits({
        favorites: [],
        moderator: [],
        subscriber: [],
        trending: await getTrending({ limit: "30" }),
      });
    }
  };

  const subscribe = async (subreddit: string) => {
    await setSubscriptionStatus(subreddit, true);
    loadSubreddits();
    alert("Subscribed to " + subreddit);
  }

  const unsubscribe = async (subreddit: string) => {
    await setSubscriptionStatus(subreddit, false);
    loadSubreddits();
    alert("Unsubscribed from " + subreddit);
  }

  useEffect(() => {
    loadSubreddits();
  }, [currentUser]);

  return (
    <SubredditContext.Provider
      value={{
        subreddits,
        subscribe,
        unsubscribe,
        toggleFavorite,
      }}
    >
      {children}
    </SubredditContext.Provider>
  );
}
