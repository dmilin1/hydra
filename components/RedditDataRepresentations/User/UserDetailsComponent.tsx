import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";

import { User } from "../../../api/User";
import {
  t,
  ThemeContext,
} from "../../../contexts/SettingsContexts/ThemeContext";
import Numbers from "../../../utils/Numbers";
import Time from "../../../utils/Time";
import { useURLNavigation } from "../../../utils/navigation";
import List from "../../UI/List";

type UserDetailsComponentProps = {
  user: User;
};

export default function UserDetailsComponent({
  user,
}: UserDetailsComponentProps) {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  return (
    <View>
      <View style={styles.statsContainer}>
        {[
          {
            statName: "Comment\nKarma",
            statValue: new Numbers(user.commentKarma).prettyNum(),
          },
          {
            statName: "Post\nKarma",
            statValue: new Numbers(user.postKarma).prettyNum(),
          },
          {
            statName: "Account\nAge",
            statValue: new Time(user.createdAt * 1000).prettyTimeSince(),
          },
        ].map((stat) => (
          <View style={styles.statContainer} key={stat.statName}>
            <Text
              style={t(styles.statsNum, {
                color: theme.text,
              })}
            >
              {stat.statValue}
            </Text>
            <Text
              style={t(styles.statsDescription, {
                color: theme.verySubtleText,
              })}
            >
              {stat.statName}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.buttonsContainer}>
        <List
          items={[
            {
              key: "posts",
              icon: (
                <Feather name="file-text" size={24} color={theme.iconPrimary} />
              ),
              text: "Posts",
              onPress: () => pushURL(`/user/${user.userName}/submitted`),
            },
            {
              key: "comments",
              icon: (
                <FontAwesome5
                  name="comment"
                  size={24}
                  color={theme.iconPrimary}
                />
              ),
              text: "Comments",
              onPress: () => pushURL(`/user/${user.userName}/comments`),
            },
            ...(user.isLoggedInUser
              ? [
                  {
                    key: "upvoted",
                    icon: (
                      <Feather
                        name="thumbs-up"
                        size={24}
                        color={theme.iconPrimary}
                      />
                    ),
                    text: "Upvoted",
                    onPress: () => pushURL(`/user/${user.userName}/upvoted`),
                  },
                  {
                    key: "downvoted",
                    icon: (
                      <Feather
                        name="thumbs-down"
                        size={24}
                        color={theme.iconPrimary}
                      />
                    ),
                    text: "Downvoted",
                    onPress: () => pushURL(`/user/${user.userName}/downvoted`),
                  },
                  {
                    key: "hidden",
                    icon: (
                      <Feather
                        name="eye-off"
                        size={24}
                        color={theme.iconPrimary}
                      />
                    ),
                    text: "Hidden",
                    onPress: () => pushURL(`/user/${user.userName}/hidden`),
                  },
                  {
                    key: "saved",
                    icon: (
                      <Feather
                        name="bookmark"
                        size={24}
                        color={theme.iconPrimary}
                      />
                    ),
                    text: "Saved",
                    onPress: () => pushURL(`/user/${user.userName}/saved`),
                  },
                ]
              : []),
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 25,
  },
  statContainer: {
    flex: 1,
    alignItems: "center",
  },
  statsNum: {
    fontSize: 20,
    fontWeight: "400",
    marginBottom: 5,
  },
  statsDescription: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "300",
    lineHeight: 14,
  },
});
