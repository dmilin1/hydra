import * as Notifications from "expo-notifications";
import { createContext, useContext, useEffect, useState } from "react";

import { AccountContext } from "./AccountContext";
import { getInboxItems } from "../api/Messages";
import { UserAuth } from "../api/Authentication";

type InboxContextType = {
  inboxCount: number;
  setInboxCount: (count: number) => void;
  checkForMessages: () => Promise<void>;
};

const initialInboxContext: InboxContextType = {
  inboxCount: 0,
  setInboxCount: () => {},
  checkForMessages: async () => {},
};

export const InboxContext = createContext(initialInboxContext);

export function InboxProvider({ children }: React.PropsWithChildren) {
  const { currentUser } = useContext(AccountContext);

  const [inboxCount, setInboxCount] = useState(initialInboxContext.inboxCount);

  const checkForMessages = async () => {
    /**
     * Account is set but user is not logged in. We should wait a bit.
     * User might be swapping accounts.
     */
    if (!UserAuth.modhash) return;
    const messages = await getInboxItems();
    const newMessages = messages.filter((m) => m.new);
    setInboxCount(newMessages.length);
  };

  // set up an interval to run every 60 seconds to check for new messages if the user is logged in
  useEffect(() => {
    if (!currentUser) {
      setInboxCount(0);
      return;
    }
    const interval = setInterval(checkForMessages, 1_000 * 60);
    checkForMessages();
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
        checkForMessages,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}
