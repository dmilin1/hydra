import React, { useContext, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Post, RedditViewContext } from '../../contexts/RedditViewContext';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import VideoPlayer from './VideoPlayer';
import ImageViewer from './ImageViewer';
import { ScrollView } from 'react-native-gesture-handler';
import { HistoryContext } from '../../contexts/HistoryContext';


export default function Posts() {
  const history = useContext(HistoryContext);
  const redditViewContext = useContext(RedditViewContext);
  const theme = useContext(ThemeContext);

  const lastPostCountWhenLoadingMore = useRef(0);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          tintColor={theme.text}
          refreshing={false}
          onRefresh={() => {
            history.reload();
          }}
        />
      }
      scrollEventThrottle={200}
      onScroll={(e) => {
        const pageHeight = e.nativeEvent.contentSize.height;
        const windowHeight = e.nativeEvent.layoutMeasurement.height;
        const bottomOfWindow = e.nativeEvent.contentOffset.y + windowHeight;
        if (
          bottomOfWindow >= pageHeight - windowHeight * 1.5 /* 1.5 windows from bottom of page */
          && redditViewContext.posts.length > lastPostCountWhenLoadingMore.current
        ) {
          lastPostCountWhenLoadingMore.current = redditViewContext.posts.length;
          redditViewContext.webview?.injectJavaScript(`
            window.scrollTo(0, document.body.scrollHeight);
          `);
        }
      }}
    >
      {redditViewContext.posts
      .filter(post => !post.isAd)
      .map((post, index) => (
        <View key={index}>
          <View
            style={t(styles.postContainer, {
              backgroundColor: theme.background,
            })}
          >
            <Text
              numberOfLines={2}
              style={t(styles.postTitle, {
                color: theme.text,
              })}
            >
              {post.title}
            </Text>
            <View style={styles.postBody}>
              {post.video &&
                <View style={styles.videoContainer}>
                  <VideoPlayer source={post.video || post.externalLink}/>
                </View>
              }
              {post.images.length > 0 &&
                <View style={styles.imgContainer}>
                  <ImageViewer images={post.images}/>
                </View>
              }
              {post.bodyText &&
                <View style={styles.bodyTextContainer}>
                  <Text
                    numberOfLines={3}
                    style={t(styles.bodyText, {
                      color: theme.subtleText,
                    })}
                  >
                    {post.bodyText}
                  </Text>
                </View>
              }
              {post.externalLink &&
                <TouchableOpacity
                  style={t(styles.externalLinkContainer, {
                    borderColor: theme.tint,
                  })}
                  activeOpacity={0.5}
                  onPress={() => WebBrowser.openBrowserAsync(post.externalLink)}
                >
                  <Text
                    numberOfLines={1}
                    style={t(styles.externalLinkText, {
                      color: theme.subtleText,
                    })}
                  >
                    {post.externalLink}
                  </Text>
                </TouchableOpacity>
              }
            </View>
            <View style={styles.postFooter}>
              <View style={styles.footerLeft}>
                <View style={styles.subAndAuthorContainer}>
                  <Text style={t(styles.smallText, {
                    color: theme.subtleText,
                  })}>in </Text>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => history.pushPath(`/r/${post.subreddit}`)}
                  >
                    <Text style={t(styles.boldedSmallText, {
                      color: theme.subtleText,
                    })}>
                      {post.subreddit}
                    </Text>
                  </TouchableOpacity>
                  <Text style={t(styles.smallText, {
                    color: theme.subtleText,
                  })}> by </Text>
                  <Text style={t(styles.boldedSmallText, {
                    color: theme.subtleText,
                  })}>
                    {post.author}
                  </Text>
                </View>
                <View style={styles.metadataContainer}>
                  <Feather name="arrow-up" size={18} color={theme.subtleText} />
                  <Text style={t(styles.metadataText, {
                    color: theme.subtleText,
                  })}>
                    {post.voteCount}
                  </Text>
                  <Feather name="message-square" size={18} color={theme.subtleText} />
                  <Text style={t(styles.metadataText, {
                    color: theme.subtleText,
                  })}>
                    {post.commentCount}
                  </Text>
                  <Feather name="clock" size={18} color={theme.subtleText} />
                  <Text style={t(styles.metadataText, {
                    color: theme.subtleText,
                  })}>
                    {post.timeSincePost}
                  </Text>
                </View>
              </View>
              <View style={styles.footerRight}>

              </View>
            </View>
          </View>
          <View
            style={t(styles.spacer, {
              backgroundColor: theme.tint,
            })}
          />
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  postContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  postTitle: {
    fontSize: 17,
    paddingHorizontal: 10,
  },
  postBody: {
    flex: 1,
    marginVertical: 5,
  },
  postFooter: {
    marginHorizontal: 10,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
  },
  subAndAuthorContainer: {
    flexDirection: 'row',
  },
  smallText: {
    fontSize: 14,
  },
  boldedSmallText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metadataContainer: {
    flexDirection: 'row',
    marginTop: 7,
  },
  metadataText: {
    fontSize: 14,
    marginLeft: 5,
    marginRight: 10,
  },
  spacer: {
    height: 10,
  },
  bodyTextContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  bodyText: {
    fontSize: 15,
  },
  imgContainer: {
    marginVertical: 10,
    height: 200,
  },
  videoContainer: {
    marginVertical: 10,
    height: 200,
  },
  video: {
    flex: 1,
  },
  externalLinkContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 3,
  },
  externalLinkText: {

  },
});
