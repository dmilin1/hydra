import { Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import { Message, setInboxItemNewStatus } from "../../../api/Messages";
import { InboxContext } from "../../../contexts/InboxContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../../utils/navigation";
import RenderHtml from "../../HTML/RenderHTML";
import Slideable from "../../UI/Slideable";
import useContextMenu from "../../../utils/useContextMenu";

type MessageComponentProps = {
  message: Message;
  setMessage: (message: Message) => void;
};

export default function MessageComponent({
  message,
  setMessage,
}: MessageComponentProps) {
  const { pushURL } = useURLNavigation();
  const { theme } = useContext(ThemeContext);
  const { inboxCount, setInboxCount } = useContext(InboxContext);

  const openContextMenu = useContextMenu();

  const toggleSeen = async () => {
    await setInboxItemNewStatus(message, !message.new);
    setInboxCount(inboxCount + (message.new ? -1 : 1));
    setMessage({
      ...message,
      new: !message.new,
    });
  };

  return (
    <Slideable
      right={[
        {
          icon: <Feather name="mail" size={18} color={theme.subtleText} />,
          color: theme.iconPrimary,
          action: () => toggleSeen(),
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.messageContainer,
          {
            backgroundColor: theme.background,
          },
        ]}
        onPress={() => {
          setInboxItemNewStatus(message, false);
          setMessage({
            ...message,
            new: false,
          });
          pushURL(`https://www.reddit.com/message/messages/${message.id}`);
        }}
        onLongPress={async (e) => {
          if (e.nativeEvent.touches.length > 1) return;
          const result = await openContextMenu({
            options: ["Mark as Read"],
          });
          if (result === "Mark as Read") {
            toggleSeen();
          }
        }}
      >
        <View style={styles.messageTitleContainer}>
          <Feather
            name="mail"
            size={18}
            color={message.new ? theme.iconPrimary : theme.subtleText}
          />
          <View style={styles.messageTitleTextContainer}>
            <Text
              numberOfLines={2}
              style={[
                styles.messageTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              {message.subject}
            </Text>
          </View>
        </View>
        <View style={styles.messageBody}>
          <RenderHtml html={message.html} />
        </View>
        <View style={styles.messageFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.subAndAuthorContainer}>
              <Text
                style={[
                  styles.smallText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                from{" "}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  pushURL(`https://www.reddit.com/user/${message.author}`)
                }
              >
                <Text
                  style={[
                    styles.boldedSmallText,
                    {
                      color: theme.subtleText,
                    },
                  ]}
                >
                  {message.author}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.metadataContainer}>
              <Feather name="clock" size={18} color={theme.subtleText} />
              <Text
                style={[
                  styles.metadataText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {message.timeSince}
              </Text>
            </View>
          </View>
          <View style={styles.footerRight} />
        </View>
      </TouchableOpacity>
      <View
        style={[
          styles.spacer,
          {
            backgroundColor: theme.tint,
          },
        ]}
      />
    </Slideable>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  messageTitleContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    alignItems: "center",
  },
  messageTitleTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  messageTitle: {
    fontSize: 14,
  },
  messageBody: {
    flex: 1,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  messageFooter: {
    marginHorizontal: 10,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
  },
  subAndAuthorContainer: {
    flexDirection: "row",
  },
  smallText: {
    fontSize: 14,
  },
  boldedSmallText: {
    fontSize: 14,
    fontWeight: "600",
  },
  metadataContainer: {
    flexDirection: "row",
    marginTop: 7,
    alignItems: "center",
  },
  metadataText: {
    fontSize: 14,
    marginLeft: 3,
    marginRight: 12,
  },
  spacer: {
    height: 10,
  },
});
