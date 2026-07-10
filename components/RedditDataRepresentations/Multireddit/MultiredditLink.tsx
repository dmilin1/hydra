import { Entypo, FontAwesome } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { StyleSheet, View, Text, Image, Share } from "react-native";

import { Multi } from "../../../api/Multireddit";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../../../contexts/SubredditContext";
import { useURLNavigation } from "../../../utils/navigation";
import useContextMenu from "../../../utils/useContextMenu";
import { Touchable } from "react-native-gesture-handler";

export default function MultiredditLink({ multi }: { multi: Multi }) {
  const openContextMenu = useContextMenu();
  const { deleteSubFromMulti } = useContext(SubredditContext);
  const { pushURL } = useURLNavigation();
  const { theme } = useContext(ThemeContext);

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Touchable
        onPress={() => pushURL(multi.url)}
        style={[
          styles.multiredditContainer,
          {
            borderBottomColor: theme.tint,
          },
        ]}
      >
        {multi.iconURL ? (
          <Image
            source={{ uri: multi.iconURL }}
            style={styles.multiredditIcon}
          />
        ) : (
          <FontAwesome name="reddit" size={30} color={theme.text} />
        )}
        <Text
          style={[
            styles.multiredditText,
            {
              color: theme.text,
            },
          ]}
        >
          {multi.name}
        </Text>
        <Touchable
          onPress={() => setExpanded(!expanded)}
          style={[
            styles.expandButtonContainer,
            {
              backgroundColor: theme.divider,
            },
          ]}
          activeOpacity={0.2}
          animationDuration={{ in: 0, out: 150 }}
          hitSlop={10}
        >
          <Entypo
            name={expanded ? "chevron-down" : "chevron-up"}
            color={theme.text}
            style={styles.expandButton}
          />
        </Touchable>
      </Touchable>
      {expanded && (
        <View style={styles.subredditListContainer}>
          {multi.subreddits.map((subreddit) => (
            <Touchable
              key={subreddit.name}
              onPress={() => pushURL(subreddit.url)}
              onLongPress={async () => {
                const result = await openContextMenu({
                  options: ["Delete From Multireddit", "Share"],
                });
                if (result === "Delete From Multireddit") {
                  deleteSubFromMulti(multi, subreddit.name);
                }
                if (result === "Share") {
                  Share.share({ url: subreddit.url });
                }
              }}
              style={[
                styles.multiredditContainer,
                {
                  borderBottomColor: theme.tint,
                },
              ]}
            >
              {subreddit.iconURL ? (
                <Image
                  source={{ uri: subreddit.iconURL }}
                  style={styles.multiredditIcon}
                />
              ) : (
                <FontAwesome name="reddit" size={30} color={theme.text} />
              )}
              <Text
                style={[
                  styles.multiredditText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {subreddit.name}
              </Text>
            </Touchable>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  multiredditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  multiredditIcon: {
    width: 30,
    height: 30,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  multiredditText: {
    flex: 1,
    fontSize: 16,
  },
  expandButtonContainer: {
    marginRight: 20,
    padding: 5,
    borderRadius: 5,
  },
  expandButton: {
    fontSize: 22,
  },
  subredditListContainer: {
    marginLeft: 25,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: "gray",
  },
});
