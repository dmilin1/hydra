import { Entypo, FontAwesome } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Share,
} from "react-native";

import { Multi } from "../../../api/Multireddit";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../../../contexts/SubredditContext";
import { useURLNavigation } from "../../../utils/navigation";
import useContextMenu from "../../../utils/useContextMenu";

export default function MultiredditLink({ multi }: { multi: Multi }) {
  const openContextMenu = useContextMenu();
  const { deleteSubFromMulti } = useContext(SubredditContext);
  const { pushURL } = useURLNavigation();
  const { theme } = useContext(ThemeContext);

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TouchableOpacity
        key={multi.name}
        onPress={() => pushURL(multi.url)}
        activeOpacity={0.5}
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
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={[
            styles.expandButtonContainer,
            {
              backgroundColor: theme.divider,
            },
          ]}
          hitSlop={10}
        >
          <Entypo
            name={expanded ? "chevron-down" : "chevron-up"}
            color={theme.text}
            style={styles.expandButton}
          />
        </TouchableOpacity>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.subredditListContainer}>
          {multi.subreddits.map((subreddit) => (
            <TouchableOpacity
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
              activeOpacity={0.5}
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
            </TouchableOpacity>
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
