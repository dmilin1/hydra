import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeContext, t } from '../contexts/SettingsContexts/ThemeContext';
import Scroller from '../components/UI/Scroller';
import { CommentReply, getMessages } from '../api/Messages';
import MessageComponent from '../components/RedditDataRepresentations/Message/MessageComponent';
import { InboxContext } from '../contexts/InboxContext';
import { AccountContext } from '../contexts/AccountContext';

type MessagesPageProps = {
  url: string,
}

export default function MessagesPage({ url } : MessagesPageProps) {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { inboxCount } = useContext(InboxContext);

  const [messages, setMessages] = useState<CommentReply[]>([]);

  const loadMoreMessages = async (refresh = false) => {
    if (!currentUser) return;
    const newMessages = await getMessages({
      after: refresh ? undefined : messages.slice(-1)[0]?.after
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
    <View style={t(styles.postsContainer, {
      backgroundColor: theme.background,
    })}>
      <Scroller
        loadMore={loadMoreMessages}
      >
        {messages.map(message => (
          <MessageComponent
            key={message.id}
            initialMessageState={message}
          />
        ))}
      </Scroller>
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
