import { StyleSheet, Text } from "react-native";
import { isAccessFailure } from "../../utils/useRedditDataState";
import { PropsWithChildren, useContext } from "react";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

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
  ) : (
    children
  );
}

const styles = StyleSheet.create({
  accessFailureText: {
    fontSize: 16,
    textAlign: "center",
    alignSelf: "center",
    maxWidth: 320,
    marginBottom: 150,
  },
});
