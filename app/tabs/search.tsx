import React from "react";

import HistoryStack from "../../components/Navigation/HistoryStack";
import SearchPage from "../../pages/SearchPage";

export default function Search() {
  return (
    <HistoryStack
      initialPast={[
        {
          elem: <SearchPage />,
          name: "Search",
        },
      ]}
    />
  );
}
