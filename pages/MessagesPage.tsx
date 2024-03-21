import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeContext, t } from '../contexts/ThemeContext';
import { getPosts, Post } from '../api/Posts';
import PostComponent from '../components/RedditDataRepresentations/Post/PostComponent';
import Scroller from '../components/UI/Scroller';
import { CommentReply, getMessages } from '../api/Messages';
import MessageComponent from '../components/RedditDataRepresentations/Message/MessageComponent';

type MessagesPageProps = {
  url: string,
}

export default function MessagesPage({ url } : MessagesPageProps) {
  const { theme } = useContext(ThemeContext);

  const [messages, setMessages] = useState<CommentReply[]>([]);

  const loadMoreMessages = async (refresh = false) => {
    const newMessages = await getMessages({
      after: refresh ? undefined : messages.slice(-1)[0]?.after
    });
    if (refresh) {
      setMessages(newMessages);
    } else {
      setMessages([...messages, ...newMessages]);
    }
  };

  return (
    <View style={t(styles.postsContainer, {
      backgroundColor: theme.background,
    })}>
      <Scroller
        loadMore={loadMoreMessages}
      >
        <View/>
        {messages.map((message, index) => (
          <MessageComponent
            key={index}
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
