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

import { Comment, PostDetail, submitComment } from "../../api/PostDetail";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import { useDraftState } from "../../db/functions/Drafts";
import * as Snudown from "../../external/snudown";
import RenderHtml from "../HTML/RenderHTML";
import MarkdownEditor from "../UI/MarkdownEditor";

type NewCommentProps = {
  contentSent: () => void;
  parent: Comment | PostDetail;
};

const DRAFT_PREFIX = "newCommentDraft-";

export default function NewComment({ contentSent, parent }: NewCommentProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  const parentViewAvailable = !!parent.html;

  const [text, setText] = useDraftState(DRAFT_PREFIX + parent.id);
  const [viewMode, setViewMode] = useState<"parent" | "preview">(
    parentViewAvailable ? "parent" : "preview",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const success = await submitComment(parent, text);
      if (success) {
        contentSent();
        setModal(undefined);
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
      style={t(styles.newCommentContainer, {
        backgroundColor: theme.background,
      })}
    >
      <SafeAreaView style={styles.safeContainers}>
        <KeyboardAvoidingView style={styles.safeContainers} behavior="padding">
          <View
            style={t(styles.topBar, {
              borderBottomColor: theme.tint,
            })}
          >
            <TouchableOpacity
              onPress={() => {
                setIsSubmitting(false);
                setModal(undefined);
              }}
            >
              <Text
                style={t(styles.topBarButton, {
                  color: theme.iconOrTextButton,
                })}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={t(styles.topBarTitle, {
                color: theme.text,
              })}
            >
              New Comment
            </Text>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.iconOrTextButton} />
            ) : (
              <TouchableOpacity onPress={() => submit()}>
                <Text
                  style={t(styles.topBarButton, {
                    color: theme.iconOrTextButton,
                  })}
                >
                  Post
                </Text>
              </TouchableOpacity>
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
            />
            <View
              style={t(styles.previewTypeContainer, {
                backgroundColor: theme.tint,
                borderBottomColor: theme.divider,
              })}
            >
              {parentViewAvailable && (
                <TouchableOpacity onPress={() => setViewMode("parent")}>
                  <Text
                    style={t(styles.previewTypeText, {
                      color: theme.text,
                      paddingVertical: parentViewAvailable ? 10 : 0,
                      borderColor:
                        viewMode === "parent"
                          ? theme.iconOrTextButton
                          : theme.tint,
                    })}
                  >
                    Parent
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setViewMode("preview")}>
                <Text
                  style={t(styles.previewTypeText, {
                    color: theme.text,
                    paddingVertical: 10,
                    borderColor:
                      parentViewAvailable && viewMode === "preview"
                        ? theme.iconOrTextButton
                        : theme.tint,
                  })}
                >
                  Preview
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={t(styles.renderHTMLContainer, {
                backgroundColor: theme.background,
              })}
            >
              {viewMode === "parent" ? (
                <TextInput
                  style={t(styles.parentText, { color: theme.subtleText })}
                  editable={false}
                  value={parent.text}
                  multiline
                  selectTextOnFocus
                />
              ) : (
                <RenderHtml
                  html={Snudown.markdown(text).replaceAll(/>\s+</g, "><")} // Remove whitespace between tags
                />
              )}
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
    borderWidth: 1,
    borderRadius: 5,
    overflow: "hidden",
  },
  renderHTMLContainer: {
    minHeight: 150,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  parentText: {
    flex: 1,
    fontSize: 16,
  },
});
