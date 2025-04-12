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

import { Needs2FA } from "../api/Authentication";
import Login from "../components/Modals/Login";
import Slideable from "../components/UI/Slideable";
import { AccountContext } from "../contexts/AccountContext";
import { ModalContext } from "../contexts/ModalContext";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";

export default function AccountsPage() {
  const { theme } = useContext(ThemeContext);
  const { currentAcc, accounts, logIn, logOut, removeUser } =
    useContext(AccountContext);
  const { setModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);

  return (
    <View
      style={t(styles.accountsContainer, {
        backgroundColor: theme.background,
      })}
    >
      {accounts.length ? (
        <ScrollView style={styles.scrollView}>
          {[...accounts, { username: "Logged Out", password: "" }].map(
            (account) => (
              <Slideable
                key={account.username}
                right={
                  account.username === "Logged Out"
                    ? undefined
                    : [
                        {
                          icon: (
                            <Feather name="trash" style={{ fontSize: 24 }} />
                          ),
                          color: theme.delete,
                          action: async () => {
                            setLoading(true);
                            await removeUser(account);
                            setLoading(false);
                          },
                        },
                      ]
                }
              >
                <TouchableOpacity
                  style={t(styles.accountItemContainer, {
                    borderBottomColor: theme.divider,
                  })}
                  activeOpacity={0.5}
                  onPress={async () => {
                    setLoading(true);
                    if (account.username === "Logged Out") {
                      await logOut();
                    } else {
                      try {
                        await logIn(account);
                      } catch (e) {
                        if (e instanceof Needs2FA) {
                          setModal(<Login just2FAVerifyAcc={account} />);
                        } else {
                          throw e;
                        }
                      }
                    }
                    setLoading(false);
                  }}
                >
                  <Text
                    style={t(styles.accountItemText, {
                      color: theme.text,
                    })}
                  >
                    {account.username}
                  </Text>
                  {(currentAcc?.username === account.username ||
                    (!currentAcc && account.username === "Logged Out")) && (
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
            ),
          )}
        </ScrollView>
      ) : (
        <View style={styles.noAccountsContainer}>
          <Text
            style={t(styles.noAccountsText, {
              color: theme.text,
            })}
          >
            No accounts
          </Text>
        </View>
      )}
    </View>
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
