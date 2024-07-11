import React from "react";

import HistoryStack from "../../components/Navigation/HistoryStack";
import MessagesPage from "../../pages/MessagesPage";

export default function Inbox() {
  return (
    <HistoryStack
      initialPast={[
        {
          elem: <MessagesPage />,
          name: "Inbox",
        },
      ]}
    />
  );
}
