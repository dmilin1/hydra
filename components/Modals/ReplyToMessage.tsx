import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { Message, replyToMessage } from "../../api/Messages";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useDraftState } from "../../db/functions/Drafts";
import * as Snudown from "../../external/snudown";
import RenderHtml from "../HTML/RenderHTML";
import MarkdownEditor from "../UI/MarkdownEditor";

type ReplyToMessageProps = {
  contentSent: () => void;
  previousMsg: Message;
};

const DRAFT_PREFIX = "replyToMessageDraft-";

export default function ReplyToMessage({
  contentSent,
  previousMsg,
}: ReplyToMessageProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  const [text, setText, clearTextDraft] = useDraftState(
    DRAFT_PREFIX + previousMsg.author,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const success = await replyToMessage(previousMsg, text);
      if (success) {
        contentSent();
        setModal(undefined);
        clearTextDraft();
      } else {
        throw new Error(`Failed to submit comment`);
      }
    } catch {
      setIsSubmitting(false);
      Alert.alert(`Failed to submit comment`);
    }
  };

  return (
    <View
      style={[
        styles.newCommentContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <SafeAreaView style={styles.safeContainers}>
        <KeyboardAvoidingView style={styles.safeContainers} behavior="padding">
          <View
            style={[
              styles.topBar,
              {
                borderBottomColor: theme.tint,
              },
            ]}
          >
            <Touchable
              activeOpacity={0.2}
              animationDuration={{ in: 0, out: 150 }}
              onPress={() => {
                setIsSubmitting(false);
                setModal(undefined);
              }}
            >
              <Text
                style={[
                  styles.topBarButton,
                  {
                    color: theme.iconOrTextButton,
                  },
                ]}
              >
                Cancel
              </Text>
            </Touchable>
            <Text
              style={[
                styles.topBarTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              New Message
            </Text>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.iconOrTextButton} />
            ) : (
              <Touchable
                activeOpacity={0.2}
                animationDuration={{ in: 0, out: 150 }}
                onPress={() => submit()}
              >
                <Text
                  style={[
                    styles.topBarButton,
                    {
                      color: theme.iconOrTextButton,
                    },
                  ]}
                >
                  Send
                </Text>
              </Touchable>
            )}
          </View>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <MarkdownEditor
              text={text}
              setText={setText}
              placeholder="Write a comment..."
              showCustomThemeOption={true}
            />
            <View
              style={[
                styles.previewTypeContainer,
                {
                  backgroundColor: theme.tint,
                  borderBottomColor: theme.divider,
                },
              ]}
            >
              <Text
                style={[
                  styles.previewTypeText,
                  {
                    color: theme.text,
                    paddingVertical: 0,
                  },
                ]}
              >
                Preview
              </Text>
            </View>
            <View
              style={[
                styles.renderHTMLContainer,
                {
                  backgroundColor: theme.background,
                },
              ]}
            >
              <RenderHtml
                html={
                  Snudown.markdown(text).replaceAll(/>\s+</g, "><") // Remove whitespace between tags
                }
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  newCommentContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingVertical: 10,
  },
  safeContainers: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    fontSize: 18,
  },
  topBarButton: {
    fontSize: 18,
  },
  previewTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    marginTop: 5,
    borderBottomWidth: 1,
  },
  previewTypeText: {
    fontSize: 16,
    paddingHorizontal: 20,
    borderRadius: 5,
    overflow: "hidden",
  },
  renderHTMLContainer: {
    minHeight: 150,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
