import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { CommentReply, getMessages } from "../api/Messages";
import MessageComponent from "../components/RedditDataRepresentations/Message/MessageComponent";
import Scroller from "../components/UI/Scroller";
import { AccountContext } from "../contexts/AccountContext";
import { InboxContext } from "../contexts/InboxContext";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";

export default function MessagesPage() {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { inboxCount } = useContext(InboxContext);

  const [messages, setMessages] = useState<CommentReply[]>([]);

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
    loadMoreMessages(true);
  }, [inboxCount]);

  return (
    <View
      style={t(styles.postsContainer, {
        backgroundColor: theme.background,
      })}
    >
      <Scroller loadMore={loadMoreMessages}>
        {messages.map((message) => (
          <MessageComponent key={message.id} initialMessageState={message} />
        ))}
      </Scroller>
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
