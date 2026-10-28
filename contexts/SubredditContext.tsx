import { createContext, useContext, useEffect, useRef, useState } from "react";

import { AccountContext } from "./AccountContext";
import { Multi } from "../api/Multireddit";
import {
  addToMulti,
  getMyMultis,
  removeFromMulti,
} from "../api/gql/Multireddit";
import {
  Subreddit,
  Subreddits as SubredditsObj,
  SubredditListItem,
} from "../api/Subreddits";
import {
  formatFollowedUser,
  getSubreddits,
  setSubscriptionStatus,
  sortByName,
} from "../api/gql/Subreddits";
import { setFollowStatus } from "../api/gql/User";
import { User } from "../api/User";
import KeyStore from "../utils/KeyStore";
import { ToastContext } from "./ToastContext";
import useWriteWithToast from "../utils/useWriteWithToast";

type SubredditContextType = {
  isLoadingSubreddits: boolean;
  subreddits: SubredditsObj;
  multis: Multi[];
  isSubscribed: (name: string) => boolean;
  isFavorite: (name: string) => boolean;
  /** Resolves false if it failed (a toast already says why). */
  subscribe: (subreddit: string) => Promise<boolean>;
  unsubscribe: (subreddit: string) => Promise<boolean>;
  follow: (user: User) => Promise<void>;
  unfollow: (user: User) => Promise<void>;
  toggleFavorite: (subreddit: string) => Promise<void>;
  addSubToMulti: (
    multi: Multi,
    subredditName: Subreddit["name"],
  ) => Promise<void>;
  deleteSubFromMulti: (
    multi: Multi,
    subreddit: SubredditListItem,
  ) => Promise<void>;
};

const initialAccountContext: SubredditContextType = {
  isLoadingSubreddits: true,
  subreddits: {
    favorites: [],
    moderator: [],
    subscriber: [],
  },
  multis: [],
  isSubscribed: () => false,
  isFavorite: () => false,
  subscribe: async () => false,
  unsubscribe: async () => false,
  follow: async () => {},
  unfollow: async () => {},
  toggleFavorite: async () => {},
  addSubToMulti: async () => {},
  deleteSubFromMulti: async () => {},
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
  const { currentUser, loginInitialized } = useContext(AccountContext);
  const { showToast } = useContext(ToastContext);
  const runWrite = useWriteWithToast();

  const [subreddits, setSubreddits] = useState(
    initialAccountContext.subreddits,
  );
  const [isLoadingSubreddits, setIsLoadingSubreddits] = useState(true);

  const [multis, setMultis] = useState<Multi[]>([]);

  const getStorageKey = () => {
    if (!currentUser) {
      alert("You must be logged in to favorite subreddits");
      throw new NeedsLoginToFavorite();
    }
    return `favoriteSubreddits:${currentUser.id}`;
  };

  const getFavoriteSubNames = (): string[] => {
    const favs = KeyStore.getString(getStorageKey());
    return favs ? JSON.parse(favs) : [];
  };

  // Names from URLs keep the URL's casing (r/askreddit for AskReddit).
  const byName = (name: string) => (sub: SubredditListItem) =>
    sub.name.toLowerCase() === name.toLowerCase();

  const isSubscribed = (name: string) =>
    subreddits.subscriber.some(byName(name));

  const isFavorite = (name: string) => subreddits.favorites.some(byName(name));

  const toggleFavorite = async (subredditName: string): Promise<void> => {
    try {
      const subToFavorite = subreddits.subscriber.find(byName(subredditName));
      if (!subToFavorite) {
        alert("You must be subscribed to a subreddit to favorite it");
        throw new NeedsSubscriptionToFavorite();
      }
      const { name } = subToFavorite;

      const currentFavorites = getFavoriteSubNames();
      let newFavorites: string[];
      let newFavoriteSubs: SubredditListItem[];
      if (isFavorite(name)) {
        newFavorites = currentFavorites.filter((fav) => fav !== name);
        newFavoriteSubs = subreddits.favorites.filter(
          (fav) => fav.name !== name,
        );
      } else {
        newFavorites = [...currentFavorites, name];
        newFavoriteSubs = [...subreddits.favorites, subToFavorite];
      }

      KeyStore.set(getStorageKey(), JSON.stringify(newFavorites));
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

  /**
   * Updates the lists from the subscription change itself instead of
   * reloading them, since Reddit can still return the old lists right after.
   */
  const updateSubscription = (
    changed: SubredditListItem,
    subscribed: boolean,
  ) => {
    const isChanged = byName(changed.name);
    // Unsubscribing keeps a favorite's name saved, so it comes back with a
    // re-subscribe, like it does when the lists load.
    const restoreFavorite =
      subscribed && getFavoriteSubNames().includes(changed.name);
    setSubreddits((current) => {
      const subscriber = current.subscriber.filter((sub) => !isChanged(sub));
      const favorites = subscribed
        ? current.favorites
        : current.favorites.filter((sub) => !isChanged(sub));
      return {
        ...current,
        subscriber: subscribed
          ? [...subscriber, changed].sort(sortByName)
          : subscriber,
        favorites:
          restoreFavorite && !favorites.some(isChanged)
            ? [...favorites, changed].sort(sortByName)
            : favorites,
      };
    });
  };

  const subscribe = async (subreddit: string) => {
    const changed = await runWrite("subscribe", () =>
      setSubscriptionStatus(subreddit, true),
    );
    if (!changed) return false;
    updateSubscription(changed.subreddit, changed.subscribed);
    showToast({
      title: "Subscribed!",
      body: "You've subscribed to " + subreddit,
    });
    return true;
  };

  const unsubscribe = async (subreddit: string) => {
    const changed = await runWrite("unsubscribe", () =>
      setSubscriptionStatus(subreddit, false),
    );
    if (!changed) return false;
    updateSubscription(changed.subreddit, changed.subscribed);
    showToast({
      title: "Unsubscribed!",
      body: "You've unsubscribed from " + subreddit,
    });
    return true;
  };

  /**
   * Followed users are listed among the subscriptions as u_<name>, so the
   * lists update the same way as for a subscribe.
   */
  const setFollowing = async (user: User, following: boolean) => {
    const done = await runWrite(following ? "follow" : "unfollow", () =>
      setFollowStatus(user, following),
    );
    if (!done) return;
    updateSubscription(formatFollowedUser(user.userName), following);
    showToast({
      title: following ? "Followed!" : "Unfollowed!",
      body: `You've ${following ? "followed" : "unfollowed"} u/${user.userName}`,
    });
  };

  const follow = async (user: User) => setFollowing(user, true);

  const unfollow = async (user: User) => setFollowing(user, false);

  // Not reloading the multis after a change: right after it, Reddit can return
  // the old list.
  const updateMulti = (
    multi: Multi,
    change: (subreddits: SubredditListItem[]) => SubredditListItem[],
  ) =>
    setMultis((current) =>
      current.map((m) =>
        m.url === multi.url ? { ...m, subreddits: change(m.subreddits) } : m,
      ),
    );

  const addSubToMulti = async (
    multi: Multi,
    subredditName: Subreddit["name"],
  ) => {
    try {
      const added = await addToMulti(multi, subredditName);
      updateMulti(multi, (subs) =>
        [...subs.filter((sub) => sub.id !== added.id), added].sort(sortByName),
      );
      showToast({
        title: "Added to multi!",
        body: `${subredditName} has been added to ${multi.name}`,
      });
    } catch (e) {
      alert("Something went wrong: " + e);
    }
  };

  const deleteSubFromMulti = async (
    multi: Multi,
    subreddit: SubredditListItem,
  ) => {
    try {
      await removeFromMulti(multi, subreddit);
      updateMulti(multi, (subs) =>
        subs.filter((sub) => sub.id !== subreddit.id),
      );
      showToast({
        title: "Removed from multi!",
        body: `${subreddit.name} has been removed from ${multi.name}`,
      });
    } catch (e) {
      alert("Something went wrong: " + e);
    }
  };

  // A load for the previous account can finish after the account changes.
  const latestLoad = useRef(0);

  const loadData = async () => {
    const load = ++latestLoad.current;
    const isLatest = () => load === latestLoad.current;
    setIsLoadingSubreddits(true);
    if (!currentUser) {
      setSubreddits({ favorites: [], moderator: [], subscriber: [] });
      setMultis([]);
      setIsLoadingSubreddits(false);
      return;
    }
    try {
      const favoriteSubNames = getFavoriteSubNames();
      const lists = await getSubreddits();
      if (!isLatest()) return;
      setSubreddits({
        ...lists,
        favorites: lists.subscriber.filter((sub) =>
          favoriteSubNames.includes(sub.name),
        ),
      });
      const multis = await getMyMultis();
      if (isLatest()) setMultis(multis);
    } catch (e) {
      if (isLatest()) throw e;
    } finally {
      if (isLatest()) setIsLoadingSubreddits(false);
    }
  };

  useEffect(() => {
    if (!loginInitialized) return;
    loadData();
  }, [currentUser, loginInitialized]);

  return (
    <SubredditContext.Provider
      value={{
        isLoadingSubreddits,
        subreddits,
        multis,
        isSubscribed,
        isFavorite,
        subscribe,
        unsubscribe,
        follow,
        unfollow,
        toggleFavorite,
        addSubToMulti,
        deleteSubFromMulti,
      }}
    >
      {children}
    </SubredditContext.Provider>
  );
}
