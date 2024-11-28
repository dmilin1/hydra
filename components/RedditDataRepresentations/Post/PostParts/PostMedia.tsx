import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useContext, useState } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";

import ImageViewer from "./PostMediaParts/ImageViewer";
import Link from "./PostMediaParts/Link";
import PollViewer from "./PostMediaParts/PollViewer";
import VideoPlayer from "./PostMediaParts/VideoPlayer";
import { PostDetail } from "../../../../api/PostDetail";
import { Post } from "../../../../api/Posts";
import { PostSettingsContext } from "../../../../contexts/SettingsContexts/PostSettingsContext";
import {
  ThemeContext,
  t,
} from "../../../../contexts/SettingsContexts/ThemeContext";
import RenderHtml from "../../../HTML/RenderHTML";

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

  return (
    <>
      {post.video && (
        <View style={styles.videoContainer}>
          <VideoPlayer
            source={post.video}
            redditAudioSource={post.redditAudioSource}
            thumbnail={post.imageThumbnail}
          />
        </View>
      )}
      {post.images.length > 0 && (
        <View style={styles.imgContainer}>
          <ImageViewer
            images={post.images}
            thumbnail={post.imageThumbnail}
            resizeDynamically
          />
        </View>
      )}
      {renderHTML
        ? post.html && (
            <View style={styles.bodyHTMLContainer}>
              <RenderHtml html={post.html} />
            </View>
          )
        : post.text && (
            <View style={styles.bodyTextContainer}>
              <Text
                numberOfLines={maxLines}
                style={t(styles.bodyText, {
                  color: theme.subtleText,
                })}
              >
                {post.text.trim()}
              </Text>
            </View>
          )}
      {post.poll && (
        <View style={styles.pollContainer}>
          <PollViewer poll={post.poll} />
        </View>
      )}
      {post.externalLink && <Link link={post.externalLink} />}
      {isBlurable && blur && (
        <TouchableOpacity
          style={styles.blurContainer}
          onPress={() => setBlur(false)}
          activeOpacity={1}
        >
          <BlurView intensity={80} style={styles.blur} />
          <View style={styles.blurIconContainer}>
            <View
              style={t(styles.blurIconBox, {
                backgroundColor: theme.background,
              })}
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
    height: 200,
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
