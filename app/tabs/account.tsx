import React, { useContext } from "react";

import HistoryStack from "../../components/Navigation/HistoryStack";
import { AccountContext } from "../../contexts/AccountContext";
import AccountsPage from "../../pages/AccountsPage";
import UserPage from "../../pages/UserPage";

export default function Account() {
  const { currentUser } = useContext(AccountContext);

  return currentUser ? (
    <HistoryStack
      key={currentUser.id}
      initialPast={[
        {
          elem: <UserPage url="https://www.reddit.com/user/me" />,
          name: currentUser.userName,
        },
      ]}
    />
  ) : (
    <HistoryStack
      key="logged out"
      initialPast={[
        {
          elem: <AccountsPage url="hydra://accounts" />,
          name: "Accounts",
        },
      ]}
    />
  );
}
