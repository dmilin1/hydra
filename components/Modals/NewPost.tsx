import {
  useMediaLibraryPermissions,
  launchImageLibraryAsync,
} from "expo-image-picker";
import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { uploadImage } from "../../api/Media";
import { submitPost } from "../../api/PostDetail";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import * as Snudown from "../../external/snudown";
import RenderHtml from "../HTML/RenderHTML";
import MarkdownEditor from "../UI/MarkdownEditor";

type NewPostProps = {
  contentSent: (text: string) => void;
  subreddit: string;
};

export default function NewPostEditor({
  contentSent,
  subreddit,
}: NewPostProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kind, setKind] = useState<"self" | "link" | "image">("self");

  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [localImgUrl, setLocalImgUrl] = useState<string>();

  const [mediaAccess, requestMediaAccess] = useMediaLibraryPermissions();

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const newPost = await submitPost(subreddit, kind, title, text);
      if (newPost.success) {
        if (newPost.url) {
          contentSent(newPost.url);
        } else {
          /**
           * Image uploads don't return a URL. They do give a websocket, so there
           * might be a way to get the URL from that. But that's a future problem.
           */
          Alert.alert(`Submitted post successfully`, "Post is being processed");
        }
        setModal(undefined);
      } else {
        throw new Error(`Failed to submit post`);
      }
    } catch {
      setIsSubmitting(false);
      Alert.alert(`Failed to submit post`);
    }
  };

  const selectImage = async () => {
    if (!mediaAccess?.granted && !mediaAccess?.canAskAgain) {
      Alert.alert(
        "Permission Denied",
        "Please enable media library access in settings to upload images.",
      );
      return;
    } else if (!mediaAccess?.granted) {
      const response = await requestMediaAccess();
      if (!response.granted) {
        Alert.alert(
          "Permission Denied",
          "Please enable media library access in settings to upload images.",
        );
        return;
      }
    }
    const result = await launchImageLibraryAsync();
    if (result.canceled) {
      return;
    }
    const imageAsset = result.assets[0];
    setIsUploadingImg(true);
    try {
      const imgURL = await uploadImage(imageAsset);
      if (imgURL) {
        setText(imgURL);
        setLocalImgUrl(imageAsset.uri);
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (_e) {
      Alert.alert("Failed to upload image", "Please try again later.");
    } finally {
      setIsUploadingImg(false);
    }
  };

  return (
    <View
      style={t(styles.newPostContainer, {
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
              New Post
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
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={t(styles.postTypeBtn, {
                  backgroundColor: theme.iconSecondary,
                })}
                onPress={() =>
                  setKind((kind) => {
                    setLocalImgUrl(undefined);
                    if (kind === "self") return "link";
                    if (kind === "link") return "image";
                    return "self";
                  })
                }
              >
                <Text>
                  {kind === "self"
                    ? "Text Post"
                    : kind === "link"
                      ? "Link Post"
                      : "Image Post"}
                </Text>
              </TouchableOpacity>
            </View>
            {kind === "self" ? (
              <>
                <MarkdownEditor
                  setText={setText}
                  text={text}
                  placeholder="Write your post..."
                />
                <View
                  style={t(styles.previewTypeContainer, {
                    backgroundColor: theme.tint,
                    borderBottomColor: theme.divider,
                  })}
                >
                  <Text
                    style={t(styles.previewTypeText, {
                      color: theme.text,
                    })}
                  >
                    Preview
                  </Text>
                </View>
                <View
                  style={t(styles.renderHTMLContainer, {
                    backgroundColor: theme.background,
                  })}
                >
                  <RenderHtml
                    html={
                      Snudown.markdown(text).replaceAll(/>\s+</g, "><") // Remove whitespace between tags
                    }
                  />
                </View>
              </>
            ) : kind === "link" ? (
              <TextInput
                style={t(styles.urlInput, {
                  color: theme.text,
                  borderBottomColor: theme.divider,
                  backgroundColor: theme.tint,
                })}
                placeholder="URL"
                placeholderTextColor={theme.verySubtleText}
                value={text}
                onChangeText={setText}
                scrollEnabled={false}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
            ) : kind === "image" ? (
              <>
                <TouchableOpacity
                  style={t(styles.uploadImageButton, {
                    backgroundColor: theme.iconPrimary,
                  })}
                  activeOpacity={0.5}
                  onPress={() => selectImage()}
                >
                  {isUploadingImg ? (
                    <ActivityIndicator size="small" color={theme.text} />
                  ) : (
                    <Text
                      style={t(styles.uploadImageText, {
                        color: theme.text,
                      })}
                    >
                      Select Image
                    </Text>
                  )}
                </TouchableOpacity>
                {localImgUrl ? (
                  <Image src={localImgUrl} style={styles.image} />
                ) : null}
              </>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  newPostContainer: {
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
  urlInput: {
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginHorizontal: 5,
    marginVertical: 10,
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
  uploadImageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginHorizontal: 5,
    marginVertical: 10,
    alignSelf: "center",
  },
  uploadImageText: {
    textAlign: "center",
    fontSize: 16,
  },
  image: {
    width: "100%",
    flex: 1,
    marginVertical: 10,
    alignSelf: "center",
  },
});
