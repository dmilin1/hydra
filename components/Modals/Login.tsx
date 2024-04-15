import { Feather } from "@expo/vector-icons";
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

import { AccountContext } from "../../contexts/AccountContext";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const { addUser } = useContext(AccountContext);
  const { setModal } = useContext(ModalContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
                if (await addUser({ username, password })) {
                  setModal(null);
                  setUsername("");
                  setPassword("");
                }
                setLoading(false);
              }}
            >
              <Text
                style={t(styles.buttonText, {
                  color: theme.buttonText,
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
