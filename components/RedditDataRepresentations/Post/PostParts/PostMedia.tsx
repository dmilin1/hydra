import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useContext, useRef, useState } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";

import CrossPost from "./PostMediaParts/CrossPost";
import ImageViewer from "./PostMediaParts/ImageViewer";
import Link from "./PostMediaParts/Link";
import PollViewer from "./PostMediaParts/PollViewer";
import VideoPlayer from "./PostMediaParts/VideoPlayer";
import { PostDetail } from "../../../../api/PostDetail";
import { Post } from "../../../../api/Posts";
import { PostSettingsContext } from "../../../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";
import RenderHtml from "../../../HTML/RenderHTML";
import { extractThemeFromText } from "../../../../utils/colors";
import ThemeImport from "../../../UI/Themes/ThemeImport";
import { CustomTheme } from "../../../../constants/Themes";

type PostMediaProps = {
  post: Post | PostDetail;
  renderHTML?: boolean;
  maxLines?: number;
};

export default function PostMedia({
  post,
  renderHTML = true,
  maxLines,
}: PostMediaProps) {
  const { theme } = useContext(ThemeContext);
  const { blurNSFW, blurSpoilers } = useContext(PostSettingsContext);

  const isBlurable =
    (blurNSFW && post.isNSFW) || (blurSpoilers && post.isSpoiler);

  const [blur, setBlur] = useState(isBlurable);

  const lastLoadedPost = useRef(post.id);
  if (lastLoadedPost.current !== post.id) {
    // Component was recycled by FlashList. Need to reset state.
    // https://shopify.github.io/flash-list/docs/recycling
    lastLoadedPost.current = post.id;
    setBlur(isBlurable);
  }

  let postText = post.text;
  let customThemes: CustomTheme[] = [];
  if (!renderHTML) {
    const { customThemes: custThemes, remainingText } = extractThemeFromText(
      post.text,
    );
    postText = remainingText;
    customThemes = custThemes;
  }

  return post.crossPost ? (
    <CrossPost post={post.crossPost} />
  ) : (
    <>
      {post.video && (
        <View style={styles.videoContainer}>
          <VideoPlayer
            source={post.video}
            videoDownloadURL={post.videoDownloadURL}
            thumbnail={post.imageThumbnail}
            aspectRatio={post.mediaAspectRatio}
          />
        </View>
      )}
      {post.images.length > 0 && (
        <View style={styles.imgContainer}>
          <ImageViewer
            images={post.images}
            thumbnail={post.imageThumbnail}
            aspectRatio={post.mediaAspectRatio}
          />
        </View>
      )}
      {renderHTML
        ? post.html && (
            <View style={styles.bodyHTMLContainer}>
              <RenderHtml html={post.html} />
            </View>
          )
        : postText && (
            <View style={styles.bodyTextContainer}>
              <Text
                numberOfLines={maxLines}
                style={[
                  styles.bodyText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {postText.trim()}
              </Text>
            </View>
          )}
      {post.poll && (
        <View style={styles.pollContainer}>
          <PollViewer poll={post.poll} />
        </View>
      )}
      {(post.link || post.crossCommentLink) && <Link post={post} />}
      {customThemes.map((customTheme, i) => (
        <ThemeImport key={customTheme.name + i} customTheme={customTheme} />
      ))}
      {isBlurable && blur && (
        <TouchableOpacity
          style={styles.blurContainer}
          onPress={() => setBlur(false)}
          activeOpacity={1}
        >
          <BlurView intensity={80} style={styles.blur} />
          <View style={styles.blurIconContainer}>
            <View
              style={[
                styles.blurIconBox,
                {
                  backgroundColor: theme.background,
                },
              ]}
            >
              <AntDesign name="eye" size={22} color={theme.subtleText} />
              <Text style={{ color: theme.subtleText }}>
                {post.isNSFW ? "NSFW" : post.isSpoiler ? "Spoiler" : ""}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  crossPostContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 3,
  },
  externalLinkContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 3,
  },
  bodyTextContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  bodyHTMLContainer: {
    marginHorizontal: 15,
  },
  bodyText: {
    fontSize: 15,
  },
  imgContainer: {
    marginVertical: 10,
  },
  videoContainer: {
    marginVertical: 10,
  },
  video: {
    flex: 1,
  },
  pollContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
  },
  blur: {
    width: "100%",
    height: "100%",
  },
  blurIconContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  blurIconBox: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "pink",
    alignItems: "center",
  },
});
