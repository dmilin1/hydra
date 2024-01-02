import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { ThemeContext, t } from '../contexts/ThemeContext';
import VideoPlayer from '../components/RedditDataRepresentations/Post/PostParts/VideoPlayer';
import ImageViewer from '../components/RedditDataRepresentations/Post/PostParts/ImageViewer';
import PollViewer from '../components/RedditDataRepresentations/Post/PostParts/PollViewer';
import { ScrollView } from 'react-native-gesture-handler';
import { HistoryContext } from '../contexts/HistoryContext';
import { getPosts, Post } from '../api/Posts';
import PostComponent from '../components/RedditDataRepresentations/Post/PostComponent';

type PostsProps = {
  url: string,
}

export default function Posts({ url } : PostsProps) {
  const theme = useContext(ThemeContext);

  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const isLoadingMore = useRef(false);

  const loadMorePosts = async (refresh = false) => {
    const newPosts = await getPosts(url, {
      after: refresh ? undefined : posts.slice(-1)[0]?.after
    });
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
              bottomOfWindow >= pageHeight - windowHeight * 1.5 /* 1.5 windows from bottom of page */
              && !isLoadingMore.current
            ) {
              isLoadingMore.current = true;
              loadMorePosts();
            }
          }}
        >
          {posts.map(post => (
            <PostComponent key={post.id} post={post}/>
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
});
