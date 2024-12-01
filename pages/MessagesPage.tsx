import { useIsFocused } from "@react-navigation/native";
import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { CommentReply, getMessages } from "../api/Messages";
import MessageComponent from "../components/RedditDataRepresentations/Message/MessageComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import { AccountContext } from "../contexts/AccountContext";
import { InboxContext } from "../contexts/InboxContext";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";
import useRedditDataState from "../utils/useRedditDataState";

export default function MessagesPage() {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { inboxCount } = useContext(InboxContext);

  const isFocused = useIsFocused();

  const {
    data: messages,
    setData: setMessages,
    modifyData: modifyMessages,
    fullyLoaded,
  } = useRedditDataState<CommentReply>();

  const loadMoreMessages = async (refresh = false) => {
    if (!currentUser) return;
    const newMessages = await getMessages({
      after: refresh ? undefined : messages.slice(-1)[0]?.after,
    });
    if (refresh) {
      setMessages(newMessages);
    } else {
      setMessages([...messages, ...newMessages]);
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    loadMoreMessages(true);
  }, [inboxCount, isFocused]);

  return (
    <View
      style={t(styles.postsContainer, {
        backgroundColor: theme.background,
      })}
    >
      <RedditDataScroller<CommentReply>
        loadMore={loadMoreMessages}
        fullyLoaded={fullyLoaded}
        data={messages}
        renderItem={({ item }) => (
          <MessageComponent
            message={item}
            setMessage={(newMessage) => modifyMessages([newMessage])}
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
