import * as Notifications from "expo-notifications";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { AccountContext } from "./AccountContext";
import { getUnreadInboxCount } from "../api/gql/Inbox";
import { UserAuth } from "../api/Authentication";

type InboxContextType = {
  inboxCount: number;
  setInboxCount: Dispatch<SetStateAction<number>>;
  /** Goes up each time everything is marked read, so the inbox can follow. */
  allReadCount: number;
  markedAllRead: () => void;
};

const initialInboxContext: InboxContextType = {
  inboxCount: 0,
  setInboxCount: () => {},
  allReadCount: 0,
  markedAllRead: () => {},
};

export const InboxContext = createContext(initialInboxContext);

export function InboxProvider({ children }: React.PropsWithChildren) {
  const { currentUser } = useContext(AccountContext);

  const [inboxCount, setInboxCount] = useState(initialInboxContext.inboxCount);
  const [allReadCount, setAllReadCount] = useState(0);

  const markedAllRead = () => {
    setInboxCount(0);
    setAllReadCount((count) => count + 1);
  };

  // set up an interval to run every 60 seconds to check for new items if the user is logged in
  useEffect(() => {
    if (!currentUser) {
      setInboxCount(0);
      return;
    }
    // A poll still in flight when the account changes belongs to the old one.
    let cancelled = false;
    const checkForInboxItems = async () => {
      /**
       * Account is set but user is not logged in. We should wait a bit.
       * User might be swapping accounts.
       */
      if (!UserAuth.isLoggedIn) return;
      try {
        const count = await getUnreadInboxCount();
        if (!cancelled && UserAuth.isLoggedIn) setInboxCount(count);
      } catch {
        // The next poll tries again.
      }
    };
    const interval = setInterval(checkForInboxItems, 1_000 * 60);
    checkForInboxItems();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentUser]);

  useEffect(() => {
    Notifications.setBadgeCountAsync(inboxCount);
  }, [inboxCount]);

  return (
    <InboxContext.Provider
      value={{
        inboxCount,
        setInboxCount,
        allReadCount,
        markedAllRead,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}
