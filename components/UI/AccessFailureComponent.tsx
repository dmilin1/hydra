import { TabActions, useNavigation } from "@react-navigation/native";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { isAccessFailure } from "../../utils/useRedditDataState";
import { PropsWithChildren, useContext } from "react";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { AccountContext } from "../../contexts/AccountContext";
import { ModalContext } from "../../contexts/ModalContext";
import { NotLoggedInError } from "../../api/gql/WebToken";
import Login from "../Modals/Login";

const REGISTER_URL = "https://www.reddit.com/register";

type AccessFailureComponentProps = PropsWithChildren<{
  /** Access failures get their own message; other errors a generic one. */
  accessFailure: Error | null;
  contentName: string;
}>;

export default function AccessFailureComponent({
  accessFailure,
  contentName,
  children,
}: AccessFailureComponentProps) {
  const { theme } = useContext(ThemeContext);

  const errorMessageMap = {
    PrivateSubredditError: `🔑 r/${contentName} has been set to private by its subreddit moderators`,
    BannedSubredditError: `🚫 r/${contentName} has been banned by Reddit Administrators for breaking Reddit rules`,
    SubredditDoesNotExistError: `🤷 r/${contentName} does not exist`,
    NotLoggedInError: `🔑 Log in to a Reddit account to see this`,
    UserDoesNotExistError: `🚫 ${contentName} does not exist`,
    BannedUserError: `🚫 ${contentName} has been banned`,
  };

  return accessFailure ? (
    <View style={styles.accessFailureContainer}>
      <Text
        style={[
          styles.accessFailureText,
          {
            color: theme.subtleText,
          },
        ]}
      >
        {isAccessFailure(accessFailure)
          ? errorMessageMap[accessFailure.name]
          : `😵 Couldn't load this: ${accessFailure.message}`}
      </Text>
      {accessFailure instanceof NotLoggedInError ? <LogInOptions /> : null}
    </View>
  ) : (
    children
  );
}

function LogInOptions() {
  const { theme } = useContext(ThemeContext);
  const { accounts } = useContext(AccountContext);
  const { setModal } = useContext(ModalContext);
  const navigation = useNavigation();

  const hasAccounts = accounts.length > 0;

  return (
    <View style={styles.buttons}>
      <Touchable
        style={[styles.button, { backgroundColor: theme.buttonBg }]}
        onPress={() => setModal(<Login />)}
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Log in
        </Text>
      </Touchable>
      <Touchable
        style={styles.button}
        onPress={() =>
          hasAccounts
            ? navigation.dispatch(TabActions.jumpTo("Account"))
            : Linking.openURL(REGISTER_URL)
        }
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: theme.iconOrTextButton }]}>
          {hasAccounts ? "Manage Accounts" : "Create Account"}
        </Text>
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  accessFailureContainer: {
    alignSelf: "center",
    alignItems: "center",
    maxWidth: 320,
    marginBottom: 150,
  },
  accessFailureText: {
    fontSize: 16,
    textAlign: "center",
  },
  buttons: {
    alignSelf: "stretch",
    marginTop: 20,
    gap: 10,
  },
  button: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
