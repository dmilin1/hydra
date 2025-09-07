import { Image, useImage } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import React, { useContext } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";

import { PostDetail } from "../../../../../api/PostDetail";
import { Post } from "../../../../../api/Posts";
import { PostInteractionContext } from "../../../../../contexts/PostInteractionContext";
import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import { PostSettingsContext } from "../../../../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../../../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../../../../utils/navigation";
import RedditURL from "../../../../../utils/RedditURL";

export default function Link({ post }: { post: Post | PostDetail }) {
  const { theme } = useContext(ThemeContext);
  const { linkDescriptionLength } = useContext(PostSettingsContext);
  const { pushURL } = useURLNavigation();

  const { currentDataMode } = useContext(DataModeContext);
  const { interactedWithPost } = useContext(PostInteractionContext);

  const url = post.externalLink ?? post.crossCommentLink;

  const imgRef = useImage(
    {
      uri: post.openGraphData?.image,
    },
    {
      onError: () => {
        /* This image might not exist */
      },
    },
  );

  return (
    <TouchableOpacity
      style={[
        styles.externalLinkContainer,
        {
          borderColor: theme.tint,
        },
      ]}
      activeOpacity={post.openGraphData?.image ? 0.8 : 0.5}
      onPress={() => {
        if (!url) return;
        interactedWithPost();
        try {
          new RedditURL(url);
          pushURL(url);
        } catch (_) {
          WebBrowser.openBrowserAsync(url);
        }
      }}
    >
      {post.openGraphData?.image &&
      post.openGraphData?.title &&
      post.openGraphData?.description ? (
        <>
          {currentDataMode === "normal" && (
            <Image
              source={imgRef}
              contentFit="cover"
              style={{ height: 200, borderRadius: 10 }}
              transition={250}
              recyclingKey={post.openGraphData?.image}
            />
          )}
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            {post.openGraphData.title}
          </Text>
          {linkDescriptionLength !== 0 && (
            <Text
              style={[
                styles.descriptionText,
                {
                  color: theme.subtleText,
                },
              ]}
              numberOfLines={linkDescriptionLength}
            >
              {post.openGraphData.description}
            </Text>
          )}
          <Text
            numberOfLines={1}
            style={[
              styles.linkText,
              {
                color: theme.subtleText,
              },
            ]}
          >
            {url}
          </Text>
        </>
      ) : (
        <Text
          numberOfLines={1}
          style={[
            styles.linkOnlyText,
            {
              color: theme.text,
            },
          ]}
        >
          {url}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  externalLinkContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 3,
    gap: 10,
  },
  title: {
    paddingHorizontal: 10,
  },
  descriptionText: {
    fontSize: 13,
    paddingHorizontal: 10,
  },
  linkText: {
    paddingHorizontal: 10,
    paddingBottom: 5,
    fontSize: 11,
  },
  linkOnlyText: {
    padding: 10,
  },
});
