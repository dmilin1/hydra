import { useIsFocused } from "@react-navigation/native";
import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { getInboxItems } from "../api/Inbox";
import CommentReplyComponent from "../components/RedditDataRepresentations/InboxItem/CommentReplyComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import { AccountContext } from "../contexts/AccountContext";
import { InboxContext } from "../contexts/InboxContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import useRedditDataState from "../utils/useRedditDataState";

export default function InboxPage() {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { inboxCount } = useContext(InboxContext);

  const isFocused = useIsFocused();

  const {
    data: inboxItems,
    loadMoreData: loadMoreInboxItems,
    refreshData: refreshInboxItems,
    modifyData: modifyInboxItems,
    fullyLoaded,
    hitFilterLimit,
  } = useRedditDataState({
    loadData: async (after) => {
      if (!currentUser) return [];
      return await getInboxItems({ after });
    },
  });

  useEffect(() => {
    if (!isFocused) return;
    refreshInboxItems();
  }, [inboxCount, isFocused]);

  return (
    <View
      style={[
        styles.postsContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <RedditDataScroller
        loadMore={loadMoreInboxItems}
        refresh={refreshInboxItems}
        fullyLoaded={fullyLoaded}
        hitFilterLimit={hitFilterLimit}
        data={inboxItems}
        renderItem={({ item }) => (
          <CommentReplyComponent
            commentReply={item}
            setInboxItem={(inboxItem) => modifyInboxItems([inboxItem])}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
