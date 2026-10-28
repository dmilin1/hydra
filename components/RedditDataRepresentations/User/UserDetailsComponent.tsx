import Feather from "@react-native-vector-icons/feather";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { User } from "../../../api/User";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import Numbers from "../../../utils/Numbers";
import Time from "../../../utils/Time";
import { useURLNavigation } from "../../../utils/navigation";
import List from "../../UI/List";

export type UserContentType = "posts" | "comments";

type UserDetailsComponentProps = {
  user: User;
  contentType: UserContentType;
  setContentType: (contentType: UserContentType) => void;
};

export default function UserDetailsComponent({
  user,
  contentType,
  setContentType,
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
              style={[
                styles.statsNum,
                {
                  color: theme.text,
                },
              ]}
            >
              {stat.statValue}
            </Text>
            <Text
              style={[
                styles.statsDescription,
                {
                  color: theme.verySubtleText,
                },
              ]}
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
                    key: "savedPosts",
                    icon: (
                      <Feather
                        name="bookmark"
                        size={24}
                        color={theme.iconPrimary}
                      />
                    ),
                    text: "Saved Posts",
                    onPress: () =>
                      pushURL(`/user/${user.userName}/saved?type=links`),
                  },
                  {
                    key: "savedComments",
                    icon: (
                      <MaterialCommunityIcons
                        name="comment-bookmark-outline"
                        size={24}
                        color={theme.iconPrimary}
                      />
                    ),
                    text: "Saved Comments",
                    onPress: () =>
                      pushURL(`/user/${user.userName}/saved?type=comments`),
                  },
                ]
              : []),
          ]}
        />
      </View>
      {/* Reddit has no mixed posts and comments feed, so pick one. */}
      <View style={[styles.contentToggle, { backgroundColor: theme.tint }]}>
        {(
          [
            { key: "posts", text: "Posts" },
            { key: "comments", text: "Comments" },
          ] as const
        ).map((option) => {
          const selected = contentType === option.key;
          return (
            <Touchable
              key={option.key}
              style={[
                styles.contentToggleOption,
                selected && { backgroundColor: theme.buttonBg },
              ]}
              onPress={() => setContentType(option.key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.contentToggleText,
                  { color: selected ? theme.buttonText : theme.subtleText },
                ]}
              >
                {option.text}
              </Text>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    marginBottom: 15,
  },
  contentToggle: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 3,
    borderRadius: 10,
  },
  contentToggleOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  contentToggleText: {
    fontSize: 15,
    fontWeight: "500",
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
