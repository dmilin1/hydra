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

import { Comment, editUserContent } from "../../api/PostDetail";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import * as Snudown from "../../external/snudown";
import RenderHtml from "../HTML/RenderHTML";
import MarkdownEditor from "../UI/MarkdownEditor";
import RedditURL from "../../utils/RedditURL";

type EditCommentProps = {
  contentSent: () => void;
  edit: Comment;
};

export default function EditComment({ contentSent, edit }: EditCommentProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  const [text, setText] = useState(edit.text);
  const [viewMode, setViewMode] = useState<"preview" | "old">("preview");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const success = await editUserContent(edit, text);
      if (success) {
        contentSent();
        setModal(undefined);
      } else {
        throw new Error(`Failed to edit comment`);
      }
    } catch {
      setIsSubmitting(false);
      Alert.alert(`Failed to edit comment`);
    }
  };

  return (
    <View
      style={[
        styles.editCommentContainer,
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
              Edit Comment
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
                  Edit
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
              placeholder="Edit your comment..."
              showCustomThemeOption={new RedditURL(
                edit.link,
              ).supportsSharingThemes()}
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
              <TouchableOpacity onPress={() => setViewMode("preview")}>
                <Text
                  style={[
                    styles.previewTypeText,
                    {
                      color: theme.text,
                      paddingVertical: 10,
                      borderColor:
                        viewMode === "preview"
                          ? theme.iconOrTextButton
                          : theme.tint,
                    },
                  ]}
                >
                  Preview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewMode("old")}>
                <Text
                  style={[
                    styles.previewTypeText,
                    {
                      color: theme.text,
                      paddingVertical: 10,
                      borderColor:
                        viewMode === "old"
                          ? theme.iconOrTextButton
                          : theme.tint,
                    },
                  ]}
                >
                  Old Version
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.renderHTMLContainer,
                {
                  backgroundColor: theme.background,
                },
              ]}
            >
              {viewMode === "old" ? (
                <TextInput
                  style={[styles.parentText, { color: theme.subtleText }]}
                  editable={false}
                  value={edit.text}
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
  editCommentContainer: {
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
