import { Image, useImage } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import React, { useContext } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";

import { PostDetail } from "../../../../../api/PostDetail";
import { Post } from "../../../../../api/Posts";
import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import {
  ThemeContext,
  t,
} from "../../../../../contexts/SettingsContexts/ThemeContext";

export default function Link({ post }: { post: Post | PostDetail }) {
  const { theme } = useContext(ThemeContext);

  const { currentDataMode } = useContext(DataModeContext);

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
      style={t(styles.externalLinkContainer, {
        borderColor: theme.tint,
      })}
      activeOpacity={post.openGraphData?.image ? 0.8 : 0.5}
      onPress={() => {
        if (post.link) {
          WebBrowser.openBrowserAsync(post.link);
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
            />
          )}
          <Text
            numberOfLines={1}
            style={t(styles.title, {
              color: theme.text,
            })}
          >
            {post.openGraphData.title}
          </Text>
          <Text
            style={t(styles.descriptionText, {
              color: theme.subtleText,
            })}
          >
            {post.openGraphData.description}
          </Text>
          <Text
            numberOfLines={1}
            style={t(styles.linkText, {
              color: theme.subtleText,
            })}
          >
            {post.link}
          </Text>
        </>
      ) : (
        <Text
          numberOfLines={1}
          style={t(styles.linkOnlyText, {
            color: theme.text,
          })}
        >
          {post.link}
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
  },
  title: {
    padding: 10,
  },
  descriptionText: {
    fontSize: 13,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  linkText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
  },
  linkOnlyText: {
    padding: 10,
  },
});
