import { NavigationContext, useRoute } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";

import {
  HistoryProviderProps,
  initialHistory,
  HistoryLayer,
  HistoryContext,
  HistoryFunctionsContext,
  initialHistoryFunctions,
  HistoryFunctionsContextType,
} from ".";
import Page from "../../pages";
import AccountsPage from "../../pages/AccountsPage";
import ErrorPage from "../../pages/ErrorPage";
import PostDetails from "../../pages/PostDetails";
import PostsPage from "../../pages/PostsPage";
import SettingsPage from "../../pages/SettingsPage";
import UserPage from "../../pages/UserPage";
import RedditURL, { PageType } from "../../utils/RedditURL";

/**
 * These providers are in their own file in order to avoid circular dependencies.
 */

export function HistoryProvider({
  initialPast = [],
  initialFuture = [],
  children,
}: HistoryProviderProps) {
  const historyFunctions = useContext(HistoryFunctionsContext);

  const [past, setPast] = useState<typeof initialHistory.past>(initialPast);
  const [future, setFuture] =
    useState<typeof initialHistory.future>(initialFuture);

  const navigation = useContext(NavigationContext);

  const route = useRoute();

  useEffect(() => {
    if (!navigation) return;
    // @ts-ignore: tabPress is not in the type definition even though it's in the docs
    const clearListener = navigation.addListener("tabPress", () => {
      // Handles tab presses navigating backward in the stack history
      if (navigation.isFocused()) {
        if (route.name === "Posts" && past.length === 1) {
          forward();
          return;
        }
        if (past.length > 1) {
          backward();
        }
      }
    });
    return clearListener;
  }, [past.length, future.length]);

  const pushPath = (path: string) => {
    const name = new RedditURL(path).getPageName();
    let Page: Page = ErrorPage;
    const pageType = new RedditURL(path).getPageType();
    if (pageType === PageType.HOME) {
      Page = PostsPage;
    } else if (pageType === PageType.SUBREDDIT) {
      Page = PostsPage;
    } else if (pageType === PageType.POST_DETAILS) {
      Page = PostDetails;
    } else if (pageType === PageType.USER) {
      Page = UserPage;
    } else if (pageType === PageType.ACCOUNTS) {
      Page = AccountsPage;
    } else if (pageType === PageType.SETTINGS) {
      Page = SettingsPage;
    }
    setPast([
      ...past,
      {
        elem: (
          <Page
            url={path}
            key={Math.random()} // Need key or element won't be treated as new
          />
        ),
        name,
      },
    ]);
    setFuture([]);
  };

  const pushLayer = (layer: HistoryLayer) => {
    setPast([...past, layer]);
    setFuture([]);
  };

  const reload = () => {
    const currentPath = past.slice(-1)[0]?.elem.props.path ?? "";
    backward();
    pushPath(currentPath);
  };

  const replace = (path: string) => {
    backward();
    pushPath(path);
  };

  const forward = () => {
    const popped = future.pop();
    if (popped) {
      setPast([...past, popped]);
      return popped;
    }
  };

  const backward = () => {
    const popped = past.pop();
    if (popped) {
      setFuture([...future, popped]);
      return popped;
    }
  };

  /**
   * History functions sit outside the main provider in HistoryFunctionsProvider
   * so that when the history is changed, components that only depend on
   * the functions won't re-render. This massively improves performance.
   */

  historyFunctions.setHistoryFunctions({
    setPast,
    setFuture,
    pushLayer,
    pushPath,
    reload,
    replace,
    forward,
    backward,
  });

  return (
    <HistoryContext.Provider
      value={{
        past,
        future,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function HistoryFunctionsProvider({
  children,
}: {
  children: JSX.Element;
}) {
  const historyFunctions: HistoryFunctionsContextType = {
    ...initialHistoryFunctions,
    setHistoryFunctions: (newFunctions) => {
      Object.assign(historyFunctions, newFunctions);
    },
  };

  return (
    <HistoryFunctionsContext.Provider value={historyFunctions}>
      {children}
    </HistoryFunctionsContext.Provider>
  );
}
