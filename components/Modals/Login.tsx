import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from "react-native";

import { IncorrectCredentials, Needs2FA } from "../../api/Authentication";
import { Account, AccountContext } from "../../contexts/AccountContext";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

type LoginProps = {
  just2FAVerifyAcc?: Account;
};

export default function Login({ just2FAVerifyAcc }: LoginProps) {
  const { theme } = useContext(ThemeContext);
  const { addUser, logIn } = useContext(AccountContext);
  const { setModal } = useContext(ModalContext);
  const [username, setUsername] = useState(just2FAVerifyAcc?.username ?? "");
  const [password, setPassword] = useState(just2FAVerifyAcc?.password ?? "");
  const [twoFACode, setTwoFACode] = useState("");
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(!!just2FAVerifyAcc);

  const resetModal = () => {
    setModal(null);
    setUsername("");
    setPassword("");
    setTwoFACode("");
    setLoading(false);
  };

  const handleLoginError = (e: unknown) => {
    setLoading(false);
    if (e instanceof Needs2FA) {
      setNeeds2FA(true);
    } else if (e instanceof IncorrectCredentials) {
      alert("Incorrect username or password");
    }
  };

  const submit2FACheck = async () => {
    try {
      await logIn({
        username,
        password: needs2FA ? `${password}:${twoFACode}` : password,
      });
      resetModal();
    } catch (e) {
      handleLoginError(e);
    }
  };

  const addNewUser = async () => {
    try {
      await addUser({ username, password }, twoFACode);
      resetModal();
    } catch (e) {
      handleLoginError(e);
    }
  };

  return (
    <>
      <View
        style={t(styles.loginSubContainer, {
          backgroundColor: theme.background,
          borderColor: theme.divider,
        })}
      >
        <View style={styles.iconContainer}>
          <Feather
            name="user-plus"
            style={{ color: theme.text, fontSize: 32 }}
          />
        </View>
        <View style={styles.fieldContainer}>
          <Text
            style={t(styles.textLabel, {
              color: theme.text,
            })}
          >
            Username:
          </Text>
          <TextInput
            style={t(styles.textInput, {
              color: theme.text,
              borderColor: theme.divider,
            })}
            onChangeText={(text) => setUsername(text)}
            value={username}
            autoComplete="username"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.fieldContainer}>
          <Text
            style={t(styles.textLabel, {
              color: theme.text,
            })}
          >
            Password:
          </Text>
          <TextInput
            style={t(styles.textInput, {
              color: theme.text,
              borderColor: theme.divider,
            })}
            onChangeText={(text) => setPassword(text)}
            value={password}
            autoComplete="current-password"
            autoCapitalize="none"
            secureTextEntry
          />
        </View>
        {needs2FA && (
          <View style={styles.fieldContainer}>
            <Text
              style={t(styles.textLabel, {
                color: theme.text,
              })}
            >
              2FA Code:
            </Text>
            <TextInput
              style={t(styles.textInput, {
                color: theme.text,
                borderColor: theme.divider,
              })}
              onChangeText={(text) => setTwoFACode(text)}
              value={twoFACode}
              autoComplete="one-time-code"
              autoCapitalize="none"
              keyboardType="number-pad"
            />
          </View>
        )}
        <View style={styles.legaleseContainer}>
          <Text
            style={t(styles.legaleseText, {
              color: theme.text,
            })}
          >
            By logging in you are agreeing to the
            <Text
              style={{ color: theme.iconOrTextButton }}
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://www.redditinc.com/policies/user-agreement",
                )
              }
            >
              {" "}
              Reddit User Agreement{" "}
            </Text>
            and the
            <Text
              style={{ color: theme.iconOrTextButton }}
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://www.redditinc.com/policies/reddit-rules",
                )
              }
            >
              {" "}
              Reddit Rules
            </Text>
            .
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <TouchableOpacity
              style={t(styles.button, {
                borderColor: theme.divider,
              })}
              onPress={async () => {
                setLoading(true);
                if (just2FAVerifyAcc) {
                  submit2FACheck();
                } else {
                  addNewUser();
                }
              }}
            >
              <Text
                style={t(styles.buttonText, {
                  color: theme.iconOrTextButton,
                })}
              >
                Login
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View
        style={styles.background}
        onTouchStart={() => {
          setModal(null);
          setUsername("");
          setPassword("");
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loginSubContainer: {
    position: "absolute",
    top: 0,
    width: Dimensions.get("window").width * 0.9,
    marginTop: "25%",
    marginHorizontal: "5%",
    zIndex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  background: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    height: Dimensions.get("window").height,
    backgroundColor: "black",
    opacity: 0.7,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  textLabel: {
    fontSize: 18,
    marginRight: 10,
  },
  textInput: {
    fontSize: 18,
    borderWidth: 1,
    flex: 1,
    borderRadius: 5,
    maxWidth: 175,
    padding: 5,
  },
  legaleseContainer: {
    marginTop: 10,
  },
  legaleseText: {},
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
  },
});
