import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import AccountList from "../components/UI/AccountList";
import { AccountContext } from "../contexts/AccountContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { oneTimeAlert } from "../utils/oneTimeAlert";

export default function AccountsPage() {
  const { theme } = useContext(ThemeContext);
  const { accounts } = useContext(AccountContext);

  useEffect(() => {
    if (accounts.length > 1) {
      oneTimeAlert(
        "quickAccountSwapGuideAlert",
        "Did you know?",
        "You can quick swap accounts by long pressing the account tab.",
      );
    }
  }, [accounts.length]);

  return (
    <View
      style={[
        styles.accountsContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <AccountList />
    </View>
  );
}

const styles = StyleSheet.create({
  accountsContainer: {
    flex: 1,
  },
});
