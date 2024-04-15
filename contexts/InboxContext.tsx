import { createContext, useContext, useEffect, useState } from "react";

import { AccountContext } from "./AccountContext";
import { getMessages } from "../api/Messages";

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
    const messages = await getMessages();
    const newMessages = messages.filter((m) => m.new);
    setInboxCount(newMessages.length);
  };

  // set up an interval to run every 30 seconds to check for new messages if the user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(checkForMessages, 30_000);
    checkForMessages();
    return () => clearInterval(interval);
  }, [currentUser]);

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
