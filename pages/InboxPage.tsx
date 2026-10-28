import { useIsFocused } from "@react-navigation/native";
import React, { useContext, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { getInboxItems } from "../api/gql/Inbox";
import CommentReplyComponent from "../components/RedditDataRepresentations/InboxItem/CommentReplyComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import { AccountContext } from "../contexts/AccountContext";
import { InboxContext } from "../contexts/InboxContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import useRedditDataState from "../utils/useRedditDataState";

export default function InboxPage() {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { inboxCount, allReadCount } = useContext(InboxContext);

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
    refreshDependencies: [currentUser?.userName],
  });

  /**
   * Reload when coming back to the inbox and when new replies arrive. Not on
   * the first focus (useRedditDataState already loads), and not when replies
   * are marked read (they update in place).
   */
  const previous = useRef({ count: inboxCount, focused: false, shown: false });
  useEffect(() => {
    const { count, focused, shown } = previous.current;
    previous.current = {
      count: inboxCount,
      focused: isFocused,
      shown: shown || isFocused,
    };
    if (!isFocused || !shown) return;
    if (!focused || inboxCount > count) {
      refreshInboxItems();
    }
  }, [inboxCount, isFocused]);

  useEffect(() => {
    if (!allReadCount) return;
    modifyInboxItems(inboxItems.map((item) => ({ ...item, new: false })));
  }, [allReadCount]);

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
