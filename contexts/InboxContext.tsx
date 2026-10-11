import * as Notifications from "expo-notifications";
import { createContext, useContext, useEffect, useState } from "react";

import { AccountContext } from "./AccountContext";
import { getInboxItems } from "../api/Inbox";
import { UserAuth } from "../api/Authentication";

type InboxContextType = {
  inboxCount: number;
  setInboxCount: (count: number) => void;
  checkForInboxItems: () => Promise<void>;
};

const initialInboxContext: InboxContextType = {
  inboxCount: 0,
  setInboxCount: () => {},
  checkForInboxItems: async () => {},
};

export const InboxContext = createContext(initialInboxContext);

export function InboxProvider({ children }: React.PropsWithChildren) {
  const { currentUser } = useContext(AccountContext);

  const [inboxCount, setInboxCount] = useState(initialInboxContext.inboxCount);

  const checkForInboxItems = async () => {
    /**
     * Account is set but user is not logged in. We should wait a bit.
     * User might be swapping accounts.
     */
    if (!UserAuth.modhash) return;
    const items = await getInboxItems();
    const newItems = items.filter((item) => item.new);
    setInboxCount(newItems.length);
  };

  // set up an interval to run every 60 seconds to check for new items if the user is logged in
  useEffect(() => {
    if (!currentUser) {
      setInboxCount(0);
      return;
    }
    const interval = setInterval(checkForInboxItems, 1_000 * 60);
    checkForInboxItems();
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    Notifications.setBadgeCountAsync(inboxCount);
  }, [inboxCount]);

  return (
    <InboxContext.Provider
      value={{
        inboxCount,
        setInboxCount,
        checkForInboxItems,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}
