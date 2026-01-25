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
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

import { uploadImage } from "../../api/Media";
import { CaptchaError, ParseableError, submitPost } from "../../api/PostDetail";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useDraftState } from "../../db/functions/Drafts";
import * as Snudown from "../../external/snudown";
import RenderHtml from "../HTML/RenderHTML";
import MarkdownEditor from "../UI/MarkdownEditor";
import RedditURL from "../../utils/RedditURL";
import { PostFlair, useAllowedPostFlairs } from "../../api/PostFlair";
import useContextMenu from "../../utils/useContextMenu";
import WebView from "react-native-webview";

type NewPostProps = {
  contentSent: (text: string) => void;
  subreddit: string;
};

type PostType = "self" | "link" | "image";

const DRAFT_PREFIX = "newPostDraft-";

export default function NewPostEditor({
  contentSent,
  subreddit,
}: NewPostProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  const { width, height } = useWindowDimensions();

  const openContextMenu = useContextMenu();

  const allowedPostFlairs = useAllowedPostFlairs(subreddit);

  const [title, setTitle, clearTitleDraft] = useDraftState(
    DRAFT_PREFIX + "title-" + subreddit,
  );
  const [text, setText, clearTextDraft] = useDraftState(
    DRAFT_PREFIX + "text-" + subreddit,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kind, setKind] = useState<PostType>("self");

  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [localImgUrl, setLocalImgUrl] = useState<string>();

  const [mediaAccess, requestMediaAccess] = useMediaLibraryPermissions();

  const [selectedFlair, setSelectedFlair] = useState<PostFlair | null>(null);

  const [submitThroughBrowser, setSubmitThroughBrowser] = useState(false);

  const selectFlair = async () => {
    const flair = await openContextMenu({
      options: ["No Flair", ...allowedPostFlairs.map((flair) => flair.text)],
    });
    if (flair === "No Flair") {
      setSelectedFlair(null);
    } else {
      setSelectedFlair(allowedPostFlairs.find((f) => f.text === flair) ?? null);
    }
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const newPostUrl = await submitPost(
        subreddit,
        kind,
        title,
        text,
        selectedFlair?.id,
      );
      if (newPostUrl) {
        contentSent(newPostUrl);
      } else {
        /**
         * Image uploads don't return a URL. They do give a websocket, so there
         * might be a way to get the URL from that. But that's a future problem.
         */
        Alert.alert(`Submitted post successfully`, "Post is being processed");
      }
      clearTitleDraft();
      clearTextDraft();
      setModal(undefined);
    } catch (e) {
      if (e instanceof CaptchaError) {
        Alert.alert(
          "Captcha Required",
          "Reddit is requesting a captcha to be completed to submit this post. Would you like to retry submitting this post through the in app browser?",
          [
            {
              text: "Cancel",
            },
            {
              text: "Ok",
              isPreferred: true,
              onPress: () => {
                setSubmitThroughBrowser(true);
                if (kind === "self" && text) {
                  Clipboard.setStringAsync(text);
                  Alert.alert(
                    "Your post's body has been copied to your clipboard.",
                  );
                }
              },
            },
          ],
        );
        setIsSubmitting(false);
      } else if (e instanceof ParseableError) {
        Alert.alert("Failed to submit post", e.message);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        Alert.alert(`Failed to submit post`, "Unknown error");
        throw e;
      }
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
      style={[
        styles.newPostContainer,
        {
          backgroundColor: theme.background,
          width,
          height,
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
              style={[
                styles.topBarButton,
                {
                  left: 0,
                },
              ]}
              onPress={() => {
                setIsSubmitting(false);
                setModal(undefined);
              }}
            >
              <Text
                style={[
                  styles.topBarButtonText,
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
              New Post
            </Text>
            {submitThroughBrowser ? null : isSubmitting ? (
              <ActivityIndicator
                size="small"
                color={theme.iconOrTextButton}
                style={{ position: "absolute", right: 0 }}
              />
            ) : (
              <TouchableOpacity
                style={[
                  styles.topBarButton,
                  {
                    right: 0,
                  },
                ]}
                onPress={() => submit()}
              >
                <Text
                  style={[
                    styles.topBarButtonText,
                    {
                      color: theme.iconOrTextButton,
                      textAlign: "right",
                    },
                  ]}
                >
                  Post
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {submitThroughBrowser ? (
            <WebView
              source={{
                uri: `https://new.reddit.com/r/${subreddit}/submit/?type=${kind === "self" ? "text" : kind}`,
              }}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
            ></WebView>
          ) : (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.postTypeContainer}>
                {(["self", "link", "image"] as PostType[]).map((btnKind) => (
                  <TouchableOpacity
                    key={btnKind}
                    style={[
                      styles.postTypeBtn,
                      {
                        backgroundColor:
                          btnKind === kind ? theme.tint : theme.background,
                      },
                    ]}
                    onPress={() => setKind(btnKind)}
                  >
                    <Text style={{ color: theme.text, textAlign: "center" }}>
                      {btnKind === "self"
                        ? "Text Post"
                        : btnKind === "link"
                          ? "Link Post"
                          : "Image Post"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View
                style={[
                  styles.titleContainer,
                  {
                    borderBottomColor: theme.divider,
                    backgroundColor: theme.tint,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.titleInput,
                    {
                      color: theme.text,
                    },
                  ]}
                  placeholder="Title"
                  placeholderTextColor={theme.verySubtleText}
                  value={title}
                  onChangeText={setTitle}
                  scrollEnabled={false}
                />
                {allowedPostFlairs.length > 0 && (
                  <TouchableOpacity
                    style={[
                      styles.flairBtn,
                      {
                        backgroundColor: theme.buttonBg,
                      },
                    ]}
                    onPress={() => selectFlair()}
                  >
                    <Text style={{ color: theme.buttonText }} numberOfLines={1}>
                      {selectedFlair?.text ?? "Select Flair"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {kind === "self" ? (
                <>
                  <MarkdownEditor
                    setText={setText}
                    text={text}
                    placeholder="Write your post..."
                    showCustomThemeOption={new RedditURL(
                      `https://www.reddit.com/r/${subreddit}`,
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
                    <Text
                      style={[
                        styles.previewTypeText,
                        {
                          color: theme.text,
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
                </>
              ) : kind === "link" ? (
                <TextInput
                  style={[
                    styles.urlInput,
                    {
                      color: theme.text,
                      borderBottomColor: theme.divider,
                      backgroundColor: theme.tint,
                    },
                  ]}
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
                    style={[
                      styles.uploadImageButton,
                      {
                        backgroundColor: theme.iconPrimary,
                      },
                    ]}
                    activeOpacity={0.5}
                    onPress={() => selectImage()}
                  >
                    {isUploadingImg ? (
                      <ActivityIndicator size="small" color={theme.text} />
                    ) : (
                      <Text
                        style={[
                          styles.uploadImageText,
                          {
                            color: theme.text,
                          },
                        ]}
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
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  newPostContainer: {
    position: "absolute",
    top: 0,
    zIndex: 1,
    paddingVertical: 10,
  },
  safeContainers: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 10,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    position: "relative",
  },
  topBarButton: {
    position: "absolute",
  },
  topBarTitle: {
    fontSize: 18,
  },
  topBarButtonText: {
    fontSize: 18,
    width: 100,
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
  postTypeContainer: {
    flexDirection: "row",
    marginHorizontal: 5,
    marginVertical: 10,
  },
  postTypeBtn: {
    flexGrow: 1,
    width: 0,
    padding: 10,
    borderRadius: 15,
  },
  flairBtn: {
    padding: 10,
    borderRadius: 15,
    maxWidth: 100,
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
