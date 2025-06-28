import { Feather } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import Slideable from "../components/UI/Slideable";
import { AccountContext } from "../contexts/AccountContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import useContextMenu from "../utils/useContextMenu";

export default function AccountsPage() {
  const { theme } = useContext(ThemeContext);
  const { currentUser, accounts, logIn, logOut, removeUser } =
    useContext(AccountContext);
  const openContextMenu = useContextMenu();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (username: string) => {
    setLoading(true);
    await removeUser(username);
    setLoading(false);
  };

  return (
    <View
      style={[
        styles.accountsContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {accounts.length ? (
        <ScrollView style={styles.scrollView}>
          {
            [...accounts, "Logged Out"].map((username) => (
              <Slideable
                key={username}
                right={
                  username === "Logged Out"
                    ? undefined
                    : [
                      {
                        icon: <Feather name="trash" style={{ fontSize: 24 }} />,
                        color: theme.delete,
                        action: async () => await handleDelete(username),
                      },
                    ]
                }
              >
                <TouchableOpacity
                  style={[
                    styles.accountItemContainer,
                    {
                      borderBottomColor: theme.divider,
                    },
                  ]}
                  activeOpacity={0.5}
                  onPress={async () => {
                    setLoading(true);
                    if (username === "Logged Out") {
                      await logOut();
                    } else {
                      await logIn(username);
                    }
                    setLoading(false);
                  }}
                  onLongPress={async (e) => {
                    if (e.nativeEvent.touches.length > 1) return;
                    const result = await openContextMenu({
                      options: ["Delete"],
                    });
                    if (result === "Delete") {
                      await handleDelete(username);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.accountItemText,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {username}
                  </Text>
                  {(currentUser?.userName === username ||
                    (!currentUser && username === "Logged Out")) && (
                      <>
                        {loading ? (
                          <ActivityIndicator size="small" color={theme.text} />
                        ) : (
                          <Feather
                            name="check"
                            style={{
                              fontSize: 24,
                              color: theme.iconOrTextButton,
                              marginVertical: -5,
                            }}
                          />
                        )}
                      </>
                    )}
                </TouchableOpacity>
              </Slideable>
            ))
          }
        </ScrollView >
      ) : (
        <View style={styles.noAccountsContainer}>
          <Text
            style={[
              styles.noAccountsText,
              {
                color: theme.text,
              },
            ]}
          >
            No accounts
          </Text>
        </View>
      )
      }
    </View >
  );
}

const styles = StyleSheet.create({
  accountsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  noAccountsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noAccountsText: {
    fontSize: 18,
  },
  accountItemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  accountItemText: {
    fontSize: 16,
  },
});
