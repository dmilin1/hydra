import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { AntDesign, Feather, Octicons } from '@expo/vector-icons';
import { ThemeContext, t } from '../contexts/ThemeContext';
import VideoPlayer from '../components/PostParts/VideoPlayer';
import ImageViewer from '../components/PostParts/ImageViewer';
import { ScrollView } from 'react-native-gesture-handler';
import Comments from '../components/PostParts/Comments';
import RenderHtml from '../components/RenderHTML';
import { getPostsDetail, loadMoreComments, PostDetail, Comment } from '../api/PostDetail';
import PollViewer from '../components/PostParts/PollViewer';

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
    const newComments = await loadMoreComments(postDetail?.id, commentIds, commentPath, childStartIndex);
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
              {postDetail.video &&
                <View style={styles.videoContainer}>
                  <VideoPlayer source={postDetail.video}/>
                </View>
              }
              {postDetail.images.length > 0 &&
                <View style={styles.imgContainer}>
                  <ImageViewer images={postDetail.images}/>
                </View>
              }
              {postDetail.poll &&
                <View style={styles.pollContainer}>
                  <PollViewer poll={postDetail.poll}/>
                </View>
              }
              {postDetail.html &&
                <View style={styles.bodyHTMLContainer}>
                  <RenderHtml html={postDetail.html}/>
                </View>
              }
              <View style={styles.metadataContainer}>
                <View style={styles.metadataRow}>
                  <Text style={t(styles.smallText, {
                    color: theme.subtleText,
                  })}>
                    {'in '}
                    <Text style={styles.boldedSmallText}>
                      {`r/${postDetail.subreddit}`}
                    </Text>
                    {' by '}
                    <Text style={styles.boldedSmallText}>
                      {`u/${postDetail.author}`}
                    </Text>
                  </Text>
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
            <Comments
              loadMoreComments={loadMoreCommentsFunc}
              postDetail={postDetail}
              scrollChange={scrollChange}
            />
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
  bodyHTMLContainer: {
    marginHorizontal: 15,
  },
  bodyHTML: {
    fontSize: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  imgContainer: {
    marginVertical: 10,
    height: 200,
  },
  videoContainer: {
    marginVertical: 10,
    height: 200,
  },
  pollContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
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
  }
});
