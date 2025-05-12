import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AccountContext } from "./AccountContext";
import { StackParamsList } from "../app/stack";
import KeyStore from "../utils/KeyStore";
import RedditURL from "../utils/RedditURL";
import { PageTypeToNavName } from "../utils/navigation";

export const INITIAL_TAB_STORAGE_KEY = "initialTab";
export const STARTUP_URL_STORAGE_KEY = "startupURL";

export const STARTUP_URL_DEFAULT = "https://www.reddit.com/";

export const TabIndices = {
  Posts: 0,
  Inbox: 1,
  Account: 2,
  Search: 3,
  Settings: 4,
};

let startupURL =
  KeyStore.getString(STARTUP_URL_STORAGE_KEY) ?? STARTUP_URL_DEFAULT;
let navName = "Home";
try {
  const redditURL = new RedditURL(startupURL);
  navName = PageTypeToNavName[redditURL.getPageType()];
} catch (_e) {
  startupURL = STARTUP_URL_DEFAULT;
}

const initialTabName = KeyStore.getString(INITIAL_TAB_STORAGE_KEY);
const initialTabIndex =
  TabIndices[initialTabName as keyof typeof TabIndices] ?? 0;

const INITIAL_STATE = {
  index: initialTabIndex,
  routes: [
    {
      name: "Posts",
      state: {
        type: "stack",
        routes: [
          {
            name: "Subreddits",
          },
          {
            name: navName,
            params: {
              url: new RedditURL(startupURL).applyPreferredSorts().toString(),
            },
          },
        ],
      },
    },
    {
      name: "Inbox",
      state: {
        type: "stack",
        routes: [
          {
            name: "InboxPage",
          },
        ],
      },
    },
    {
      name: "Account",
      state: {
        type: "stack",
        routes: [
          {
            name: "Accounts",
            params: { url: "hydra://accounts" },
          },
        ],
      },
    },
    {
      name: "Search",
      state: {
        type: "stack",
        routes: [
          {
            name: "SearchPage",
          },
        ],
      },
    },
    {
      name: "Settings",
      state: {
        type: "stack",
        routes: [
          {
            name: "SettingsPage",
            params: { url: "hydra://settings" },
          },
        ],
      },
    },
  ],
};

export default function NavigationProvider({ children }: PropsWithChildren) {
  const { currentUser, loginInitialized } = useContext(AccountContext);
  const navigation = useRef<NavigationContainerRef<StackParamsList>>(null);
  const [navigationReady, setNavigationReady] = useState(false);

  const setAccountTab = () => {
    if (!navigation.current) return;
    const newRoute = currentUser
      ? {
          key: `UserPage-${currentUser?.userName}`,
          name: "UserPage",
          params: {
            url: `https://www.reddit.com/user/${currentUser?.userName}`,
          },
        }
      : {
          key: `Accounts`,
          name: "Accounts",
          params: { url: "hydra://accounts" },
        };
    const currentState = navigation.current.getState();
    const updatedRoutes = currentState.routes.map((route) => {
      if (route.name === "Account") {
        return {
          ...route,
          state: {
            ...route.state,
            index: 0,
            routes: [newRoute],
          },
        };
      }
      return route;
    });
    const updatedState = {
      ...currentState,
      routes: updatedRoutes,
    };
    navigation.current?.reset(updatedState);
  };

  useEffect(() => {
    if (navigationReady && loginInitialized) {
      setAccountTab();
    }
  }, [currentUser, navigationReady, loginInitialized]);

  return (
    <NavigationContainer
      ref={navigation}
      initialState={INITIAL_STATE}
      onReady={() => {
        setNavigationReady(true);
      }}
    >
      {children}
    </NavigationContainer>
  );
}
