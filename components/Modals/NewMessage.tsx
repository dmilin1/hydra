import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { sendMessage } from "../../api/Messages";
import { User } from "../../api/User";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useDraftState } from "../../db/functions/Drafts";
import * as Snudown from "../../external/snudown";
import RenderHtml from "../HTML/RenderHTML";
import MarkdownEditor from "../UI/MarkdownEditor";

type NewMessageProps = {
  recipient: User;
  contentSent: () => void;
};

const DRAFT_PREFIX = "newMessageDraft-";

export default function NewMessage({
  recipient,
  contentSent,
}: NewMessageProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject, clearSubjectDraft] = useDraftState(
    DRAFT_PREFIX + `Subject-${recipient.userName}`,
  );
  const [text, setText, clearTextDraft] = useDraftState(
    DRAFT_PREFIX + `Text-${recipient.userName}`,
  );

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const success = await sendMessage(recipient, subject, text);
      if (success) {
        contentSent();
        setModal(undefined);
        clearSubjectDraft();
        clearTextDraft();
        Alert.alert(`Message sent!`);
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
            <TouchableOpacity
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
            </TouchableOpacity>
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
              <TouchableOpacity onPress={() => submit()}>
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
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.subjectContainer,
                {
                  borderBottomColor: theme.divider,
                  backgroundColor: theme.tint,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.subjectInput,
                  {
                    color: theme.text,
                  },
                ]}
                placeholder="Title"
                placeholderTextColor={theme.verySubtleText}
                value={subject}
                onChangeText={setSubject}
                scrollEnabled={false}
              />
            </View>
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
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
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
  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 5,
    marginVertical: 10,
    borderRadius: 15,
  },
  subjectInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
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
