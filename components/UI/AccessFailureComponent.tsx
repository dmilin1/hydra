import { StyleSheet, Text } from "react-native";
import { AccessFailure } from "../../utils/useRedditDataState";
import { PropsWithChildren, useContext } from "react";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type AccessFailureComponentProps = PropsWithChildren<{
  accessFailure: AccessFailure;
  subreddit: string;
}>;

export default function AccessFailureComponent({
  accessFailure,
  subreddit,
  children,
}: AccessFailureComponentProps) {
  const { theme } = useContext(ThemeContext);
  return accessFailure === "private" ? (
    <Text
      style={[
        styles.accessFailureText,
        {
          color: theme.subtleText,
        },
      ]}
    >
      🔑 r/{subreddit} has been set to private by its subreddit moderators
    </Text>
  ) : accessFailure === "banned" ? (
    <Text
      style={[
        styles.accessFailureText,
        {
          color: theme.subtleText,
        },
      ]}
    >
      🚫 r/{subreddit} has been banned by Reddit Administrators for breaking
      Reddit rules
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
