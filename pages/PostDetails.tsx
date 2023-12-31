import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AntDesign, Feather, Octicons } from '@expo/vector-icons';
import { ThemeContext, t } from '../contexts/ThemeContext';
import VideoPlayer from '../components/RedditDataRepresentations/Post/PostParts/PostMediaParts/VideoPlayer';
import ImageViewer from '../components/RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageViewer';
import { ScrollView } from 'react-native-gesture-handler';
import Comments from '../components/RedditDataRepresentations/Post/PostParts/Comments';
import RenderHtml from '../components/HTML/RenderHTML';
import { getPostsDetail, loadMoreComments, PostDetail, Comment } from '../api/PostDetail';
import PollViewer from '../components/RedditDataRepresentations/Post/PostParts/PostMediaParts/PollViewer';
import { HistoryContext } from '../contexts/HistoryContext';
import PostMedia from '../components/RedditDataRepresentations/Post/PostParts/PostMedia';

type PostDetailsProps = {
  url: string,
}

export type LoadMoreCommentsFunc = (
  commentIds: string[],
  commentPath: number[],
  childStartIndex: number,
) => Promise<void>;

export default function PostDetails({ url }: PostDetailsProps) {
  const theme = useContext(ThemeContext);
  const history = useContext(HistoryContext);

  const scrollHeight = useRef(0);
  const scrollView = useRef<ScrollView>(null);

  const [postDetail, setPostDetail] = useState<PostDetail>();
  const [refreshing, setRefreshing] = useState(false);

  const scrollChange = useCallback((y: number) => {
    scrollView.current?.scrollTo({
      y: scrollHeight.current + y,
      animated: true,
    });
  }, [scrollView.current]);

  const loadPostDetails = async () => {
    const postDetail = await getPostsDetail(url);
    setPostDetail(postDetail);
    setRefreshing(false);
  };

  const getCommentFromPath = (parentObject: PostDetail|Comment, commentPath: number[]) => {
    return commentPath.reduce((path: PostDetail|Comment, num) => {
      return path.comments[num]
    }, parentObject);
  }

  const loadMoreCommentsFunc: LoadMoreCommentsFunc = async (commentIds, commentPath, childStartIndex) => {
    if (!postDetail) return;
    const newComments = await loadMoreComments(postDetail.subreddit, postDetail?.id, commentIds, commentPath, childStartIndex);
    setPostDetail(oldPostDetail => {
      if (oldPostDetail) {
        const parent = getCommentFromPath(oldPostDetail, commentPath);
        parent.comments.push(...newComments);
        if (parent.loadMore) {
          parent.loadMore.childIds = parent.loadMore.childIds.filter(childId => !commentIds.includes(childId));
        }
        return oldPostDetail;
      }
    });
  }

  useEffect(() => { loadPostDetails() }, []);

  return (
    <View style={t(styles.postDetailsOuterContainer, {
      backgroundColor: theme.background,
    })}>
      {postDetail || refreshing ? (
        <ScrollView
          ref={scrollView}
          onScrollEndDrag={e => scrollHeight.current = e.nativeEvent.contentOffset.y}
          onMomentumScrollEnd={e => scrollHeight.current = e.nativeEvent.contentOffset.y}
          refreshControl={
            <RefreshControl
              tintColor={theme.text}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadPostDetails();
              }}
            />
          }
          style={{
            backgroundColor: theme.background,
          }}
        >
          {postDetail && <>
            <View style={styles.postDetailsContainer}>
              <Text style={t(styles.title, {
                color: theme.text,
              })}>
                {postDetail.title}
              </Text>
              <PostMedia
                post={postDetail}
              />
              <View style={styles.metadataContainer}>
                <View style={styles.metadataRow}>
                  <Text style={t(styles.smallText, {
                    color: theme.subtleText,
                  })}>
                    {'in '}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => history.pushPath(`/r/${postDetail.subreddit}`)}
                  >
                    <Text style={t(styles.boldedSmallText, {
                      color: theme.subtleText,
                    })}>
                      {`r/${postDetail.subreddit}`}
                    </Text>
                  </TouchableOpacity>
                  <Text style={t(styles.smallText, {
                    color: theme.subtleText,
                  })}>
                    {' by '}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => history.pushPath(`/u/${postDetail.author}`)}
                  >
                    <Text style={t(styles.boldedSmallText, {
                      color: theme.subtleText,
                    })}>
                      {`u/${postDetail.author}`}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.metadataRow, { marginTop: 5 }]}>
                  <AntDesign name="arrowup" size={15} color={theme.subtleText} />
                  <Text style={t(styles.smallText, {
                    color: theme.subtleText,
                  })}>
                    {postDetail.upvotes}
                  </Text>
                  <Text style={t(styles.smallText, {
                    color: theme.subtleText,
                  })}>
                    {'  •  '}
                    {postDetail.timeSince}
                  </Text>
                </View>
              </View>
            </View>
            <View style={t(styles.buttonsBarContainer, {
              borderTopColor: theme.tint,
            })}>
              <AntDesign name="arrowup" size={28} color={theme.iconPrimary} />
              <AntDesign name="arrowdown" size={28} color={theme.iconPrimary} />
              <Feather name="bookmark" size={28} color={theme.iconPrimary} />
              <Octicons name="reply" size={28} color={theme.iconPrimary} />
              <Feather name="share" size={28} color={theme.iconPrimary} />
            </View>
            {postDetail.comments.length > 0 ? (
              <Comments
                loadMoreComments={loadMoreCommentsFunc}
                postDetail={postDetail}
                scrollChange={scrollChange}
              />
            ) : (
              <View style={styles.noCommentsContainer}>
                <Text style={t(styles.noCommentsText, {
                  color: theme.text,
                })}>
                  No comments
                </Text>
              </View>
            )}
          </>}
        </ScrollView>
      ) : (
        <ActivityIndicator size={'small'}/>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  postDetailsOuterContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  postDetailsContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  metadataContainer: {
    marginTop: 5,
    paddingHorizontal: 15,
  },
  metadataRow: {
    flexDirection: 'row',
  },
  smallText: {
    fontSize: 14,
  },
  boldedSmallText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonsBarContainer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  noCommentsContainer: {
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 15,
  }
});
