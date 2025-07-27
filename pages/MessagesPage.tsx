import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { getConversationMessages, Message } from "../api/Messages";
import { StackPageProps } from "../app/stack";
import RenderHtml from "../components/HTML/RenderHTML";
import ReplyToMessage from "../components/Modals/ReplyToMessage";
import { AccountContext } from "../contexts/AccountContext";
import { ModalContext } from "../contexts/ModalContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../utils/RedditURL";
import Time from "../utils/Time";

export default function MessagesPage({
  route,
}: StackPageProps<"MessagesPage">) {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { setModal } = useContext(ModalContext);

  const { url } = route.params;

  const messageId = new RedditURL(url).getRelativePath().split("/")[3];

  const scrollView = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>();

  const otherUser = currentUser
    ? messages?.find((message) => message.author !== currentUser?.userName)
        ?.author
    : null;

  const lastOtherUserMessage = messages?.findLast(
    (message) => message.author === otherUser,
  );

  const loadMessages = async () => {
    if (!currentUser) return;
    setLoading(true);
    const newMessages = await getConversationMessages(messageId);
    setMessages(newMessages);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [messageId]);

  useEffect(() => {
    scrollView.current?.scrollToEnd();
  }, [messages?.length]);

  return (
    currentUser && (
      <View
        style={[
          styles.messagesContainer,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <ScrollView
          ref={scrollView}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        >
          {!loading ? (
            messages?.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor:
                      message.author === currentUser.userName
                        ? theme.iconPrimary
                        : theme.tint,
                    alignSelf:
                      message.author === currentUser.userName
                        ? "flex-end"
                        : "flex-start",
                  },
                ]}
              >
                <View style={styles.details}>
                  <Text style={{ color: theme.subtleText }}>
                    {message.author}
                  </Text>
                  <Text style={{ color: theme.subtleText }}>
                    {new Time(message.createdAt * 1_000).shortPrettyTimeSince()}
                  </Text>
                </View>
                <RenderHtml html={message.html} />
              </View>
            ))
          ) : (
            <ActivityIndicator
              style={styles.activityIndicator}
              color={theme.text}
            />
          )}
        </ScrollView>
        {otherUser && lastOtherUserMessage && (
          <View style={[styles.replyContainer]}>
            <TouchableOpacity
              style={[
                styles.replyButton,
                {
                  backgroundColor: theme.divider,
                },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                setModal(
                  <ReplyToMessage
                    contentSent={() => loadMessages()}
                    previousMsg={lastOtherUserMessage}
                  />,
                )
              }
            >
              <Text
                style={[
                  styles.replyButtonText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Reply
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
    justifyContent: "center",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    margin: 12,
    maxWidth: "70%",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  activityIndicator: {
    flex: 1,
  },
  replyContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    padding: 12,
  },
  replyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  replyButtonText: {
    fontSize: 16,
  },
});
