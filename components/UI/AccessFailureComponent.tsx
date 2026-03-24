import { StyleSheet, Text } from "react-native";
import { ErrorType, ErrorTypeResolver } from "../../utils/useRedditDataState";
import { PropsWithChildren, useContext } from "react";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type AccessFailureComponentProps<E extends ErrorType> = PropsWithChildren<{
  accessFailure: ErrorTypeResolver<E> | null;
  contentName: string;
}>;

export default function AccessFailureComponent<E extends ErrorType>({
  accessFailure,
  contentName,
  children,
}: AccessFailureComponentProps<E>) {
  const { theme } = useContext(ThemeContext);

  const errorMessageMap = {
    PrivateSubredditError: `🔑 r/${contentName} has been set to private by its subreddit moderators`,
    BannedSubredditError: `🚫 r/${contentName} has been banned by Reddit Administrators for breaking Reddit rules`,
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
      {errorMessageMap[accessFailure.name]}
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
