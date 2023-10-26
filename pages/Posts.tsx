import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { ThemeContext, t } from '../contexts/ThemeContext';
import VideoPlayer from '../components/PostParts/VideoPlayer';
import ImageViewer from '../components/PostParts/ImageViewer';
import PollViewer from '../components/PostParts/PollViewer';
import { ScrollView } from 'react-native-gesture-handler';
import { HistoryContext } from '../contexts/HistoryContext';
import { getPosts, Post } from '../api/Posts';

type PostsProps = {
  url: string,
}

export default function Posts({ url } : PostsProps) {
  const history = useContext(HistoryContext);
  const theme = useContext(ThemeContext);

  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const isLoadingMore = useRef(false);

  const loadMorePosts = async (refresh = false) => {
    const newPosts = await getPosts(url, {
      after: refresh ? undefined : posts.slice(-1)[0]?.after
    });
    console.log('loading more')
    if (refresh) {
      setPosts(newPosts);
      setRefreshing(false);
    } else {
      setPosts([...posts, ...newPosts]);
      isLoadingMore.current = false;
    }
  };

  useEffect(() => { loadMorePosts() }, []);

  return (
    <View style={t(styles.postsContainer, {
      backgroundColor: theme.background,
    })}>
      {posts.length || refreshing ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              tintColor={theme.text}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadMorePosts(true);
              }}
            />
          }
          scrollEventThrottle={200}
          onScroll={(e) => {
            const pageHeight = e.nativeEvent.contentSize.height;
            const windowHeight = e.nativeEvent.layoutMeasurement.height;
            const bottomOfWindow = e.nativeEvent.contentOffset.y + windowHeight;
            if (
              bottomOfWindow >= pageHeight - windowHeight * 0.5 /* 1.5 windows from bottom of page */
              && !isLoadingMore.current
            ) {
              isLoadingMore.current = true;
              loadMorePosts();
            }
          }}
        >
          {posts
          .map((post, index) => (
            <View key={index}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={t(styles.postContainer, {
                  backgroundColor: theme.background,
                })}
                onPress={() => {
                  history.pushPath(post.link);
                }}
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
                      <VideoPlayer source={post.video}/>
                    </View>
                  }
                  {post.images.length > 0 &&
                    <View style={styles.imgContainer}>
                      <ImageViewer images={post.images}/>
                    </View>
                  }
                  {post.text && !post.poll &&
                    <View style={styles.bodyTextContainer}>
                      <Text
                        numberOfLines={3}
                        style={t(styles.bodyText, {
                          color: theme.subtleText,
                        })}
                      >
                        {post.text.trim()}
                      </Text>
                    </View>
                  }
                  {post.externalLink &&
                    <TouchableOpacity
                      style={t(styles.externalLinkContainer, {
                        borderColor: theme.tint,
                      })}
                      activeOpacity={0.5}
                      onPress={() => {
                        if (post.externalLink) {
                          WebBrowser.openBrowserAsync(post.externalLink);
                        }
                      }}
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
                  {post.poll &&
                    <View style={styles.pollContainer}>
                      <PollViewer poll={post.poll}/>
                    </View>
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
                        onPress={() => history.pushPath(`https://www.reddit.com/r/${post.subreddit}`)}
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
                        {post.upvotes}
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
              </TouchableOpacity>
              <View
                style={t(styles.spacer, {
                  backgroundColor: theme.tint,
                })}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ActivityIndicator size={'small'}/>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
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
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 14,
    marginLeft: 3,
    marginRight: 12,
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
  pollContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
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