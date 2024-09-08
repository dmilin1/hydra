import { AntDesign, Entypo, FontAwesome } from "@expo/vector-icons";
import React, { useContext, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TextInputSelectionChangeEventData,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Comment,
  editUserContent,
  PostDetail,
  submitComment,
  submitPost,
} from "../../api/PostDetail";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import * as Snudown from "../../external/snudown";
import RenderHtml from "../HTML/RenderHTML";

type ContentEditorProps = {
  contentSent: () => void;
} & (
  | {
      mode: "makePost";
      subreddit: string;
    }
  | {
      mode: "makeComment";
      parent: Comment | PostDetail;
    }
  | {
      mode: "editComment";
      edit: Comment;
    }
);

const getSelected = (
  text: string,
  selection: React.MutableRefObject<
    TextInputSelectionChangeEventData["selection"]
  >,
) => {
  return text.slice(selection.current.start, selection.current.end);
};

const replaceText = (
  text: string,
  replacement: string,
  selection: React.MutableRefObject<
    TextInputSelectionChangeEventData["selection"]
  >,
) => {
  return (
    text.slice(0, selection.current.start) +
    replacement +
    text.slice(selection.current.end)
  );
};

export default function ContentEditor(props: ContentEditorProps) {
  const { subreddit, mode, parent, edit, contentSent } = {
    subreddit: undefined,
    parent: undefined,
    edit: undefined,
    ...props,
  };
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  const selection = useRef<TextInputSelectionChangeEventData["selection"]>({
    start: 0,
    end: 0,
  });

  const [title, setTitle] = useState("");
  const [text, setText] = useState(edit?.text ?? "");
  const [viewMode, setViewMode] = useState<"parent" | "preview">("parent");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kind, setKind] = useState<"self" | "link">("self");

  const submit = async () => {
    setIsSubmitting(true);
    try {
      let success = false;
      if (mode === "editComment") {
        success = await editUserContent(edit, text);
      } else if (mode === "makeComment") {
        success = await submitComment(parent, text);
      } else if (mode === "makePost") {
        success = await submitPost(subreddit, kind, title, text);
      }
      if (success) {
        setTimeout(() => {
          contentSent();
          setModal(undefined);
        }, 5000);
      } else {
        throw new Error(
          `Failed to submit ${mode.includes("Comment") ? "comment" : "post"}`,
        );
      }
    } catch {
      setIsSubmitting(false);
      Alert.alert(
        `Failed to ${mode.includes("edit") ? "edit" : "post"} ${mode.includes("Comment") ? "comment" : "post"}`,
      );
    }
  };

  return (
    <View
      style={t(styles.loginSubContainer, {
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
                  color: theme.buttonText,
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
              {mode === "makeComment" && "New Comment"}
              {mode === "editComment" && "Edit Comment"}
              {mode === "makePost" && "New Post"}
            </Text>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.buttonText} />
            ) : (
              <TouchableOpacity onPress={() => submit()}>
                <Text
                  style={t(styles.topBarButton, {
                    color: theme.buttonText,
                  })}
                >
                  {mode.includes("edit") ? "Edit" : "Post"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {mode === "makePost" && (
              <View
                style={t(styles.titleContainer, {
                  borderBottomColor: theme.divider,
                  backgroundColor: theme.tint,
                })}
              >
                <TextInput
                  style={t(styles.titleInput, {
                    color: theme.text,
                  })}
                  placeholder="Title"
                  placeholderTextColor={theme.verySubtleText}
                  value={title}
                  onChangeText={setTitle}
                />
                <TouchableOpacity
                  style={t(styles.postTypeBtn, {
                    backgroundColor: theme.iconSecondary,
                  })}
                  onPress={() => setKind(kind === "self" ? "link" : "self")}
                >
                  <Text>{kind === "self" ? "Text Post" : "Link Post"}</Text>
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              style={t(styles.textInput, {
                color: theme.text,
              })}
              placeholder={mode.includes("Comment") ? "Reply" : "Content"}
              placeholderTextColor={theme.verySubtleText}
              multiline
              numberOfLines={4}
              value={text}
              onChangeText={setText}
              onSelectionChange={({ nativeEvent }) => {
                selection.current = nativeEvent.selection;
              }}
            />
            <View
              style={t(styles.previewTypeContainer, {
                backgroundColor: theme.tint,
                borderBottomColor: theme.divider,
              })}
            >
              {parent && (
                <TouchableOpacity onPress={() => setViewMode("parent")}>
                  <Text
                    style={t(styles.previewTypeText, {
                      color: theme.text,
                      paddingVertical: 10,
                      borderColor:
                        viewMode === "parent" ? theme.buttonText : theme.tint,
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
                    paddingVertical: edit ? 0 : 10,
                    borderColor:
                      !edit && viewMode === "preview"
                        ? theme.buttonText
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
              <RenderHtml
                html={
                  parent && viewMode === "parent"
                    ? parent.html
                    : Snudown.markdown(text)
                }
              />
            </View>
          </ScrollView>
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={() => {
                const selectedText = getSelected(text, selection);
                Alert.prompt("URL", undefined, (url: string) => {
                  setText((text) =>
                    replaceText(text, `[${selectedText}](${url})`, selection),
                  );
                });
              }}
            >
              <AntDesign name="link" size={24} color={theme.iconPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const selectedText = getSelected(text, selection);
                setText((text) =>
                  replaceText(text, `**${selectedText}**`, selection),
                );
              }}
            >
              <FontAwesome name="bold" size={24} color={theme.iconPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const selectedText = getSelected(text, selection);
                setText((text) =>
                  replaceText(text, `*${selectedText}*`, selection),
                );
              }}
            >
              <FontAwesome name="italic" size={24} color={theme.iconPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (text === "") {
                  // If no text, add a blockquote
                  setText("> ");
                } else if (selection.current.start === selection.current.end) {
                  // If no text is selected, add to start of current paragraph
                  for (let i = selection.current.start; i > 0; i--) {
                    if (text.slice(i - 1, i) === "\n") {
                      setText((text) =>
                        replaceText(
                          text,
                          `\n> ${getSelected(text, selection)}`,
                          { current: { start: i - 1, end: i } },
                        ),
                      );
                      break;
                    }
                  }
                } else {
                  // If text is selected, quote each line
                  setText((text) => {
                    const selectedText = getSelected(text, selection);
                    return replaceText(
                      text,
                      selectedText
                        .split("\n")
                        .map((line) => `> ${line}`)
                        .join("\n"),
                      selection,
                    );
                  });
                }
              }}
            >
              <Entypo name="quote" size={24} color={theme.iconPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const selectedText = getSelected(text, selection);
                setText((text) =>
                  replaceText(text, `~~${selectedText}~~`, selection),
                );
              }}
            >
              <FontAwesome
                name="strikethrough"
                size={24}
                color={theme.iconPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const selectedText = getSelected(text, selection);
                setText((text) =>
                  replaceText(text, `>!${selectedText}!<`, selection),
                );
              }}
            >
              <FontAwesome
                name="eye-slash"
                size={24}
                color={theme.iconPrimary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loginSubContainer: {
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 5,
    marginVertical: 10,
    borderRadius: 15,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  postTypeBtn: {
    marginRight: 10,
    padding: 10,
    borderRadius: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    marginVertical: 5,
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
  bottomBar: {
    height: 50,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});
