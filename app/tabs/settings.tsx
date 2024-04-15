import React from "react";

import HistoryStack from "../../components/Navigation/HistoryStack";
import SettingsPage from "../../pages/SettingsPage";

export default function Settings() {
  return (
    <HistoryStack
      initialPast={[
        {
          elem: <SettingsPage url="hydra://settings" />,
          name: "Settings",
        },
      ]}
    />
  );
}
