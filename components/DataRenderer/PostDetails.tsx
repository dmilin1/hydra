import React, { useContext, useCallback, useRef, RefObject } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { AntDesign, Feather, Octicons } from '@expo/vector-icons';
import { RedditViewContext } from '../../contexts/RedditViewContext';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import VideoPlayer from './postParts/VideoPlayer';
import ImageViewer from './postParts/ImageViewer';
import { ScrollView } from 'react-native-gesture-handler';
import { HistoryContext } from '../../contexts/HistoryContext';
import Comments from './postParts/Comments';
import RenderHtml from './RenderHTML';


export default function PostDetails() {
  const history = useContext(HistoryContext);
  const { postDetails, comments } = useContext(RedditViewContext);
  const theme = useContext(ThemeContext);

  const scrollHeight = useRef(0);
  const scrollView = useRef<ScrollView>(null);

  const scrollChange = useCallback((y: number) => {
    scrollView.current?.scrollTo({
      y: scrollHeight.current + y,
      animated: true,
    });
  }, [scrollView.current]);

  return (
    <ScrollView
      ref={scrollView}
      onScrollEndDrag={e => scrollHeight.current = e.nativeEvent.contentOffset.y}
      onMomentumScrollEnd={e => scrollHeight.current = e.nativeEvent.contentOffset.y}
      refreshControl={
        <RefreshControl
          tintColor={theme.text}
          refreshing={false}
          onRefresh={() => {
            history.reload();
          }}
        />
      }
    >
      {postDetails && <>
        <View style={styles.postDetailsContainer}>
          <Text style={t(styles.title, {
            color: theme.text,
          })}>
            {postDetails.title}
          </Text>
          {postDetails.video &&
            <View style={styles.videoContainer}>
              <VideoPlayer source={postDetails.video || postDetails.externalLink}/>
            </View>
          }
          {postDetails.images.length > 0 &&
            <View style={styles.imgContainer}>
              <ImageViewer images={postDetails.images}/>
            </View>
          }
          {postDetails.bodyHTML &&
            <View style={styles.bodyHTMLContainer}>
              <RenderHtml html={postDetails.bodyHTML}/>
            </View>
          }
          <View style={styles.metadataContainer}>
            <View style={styles.metadataRow}>
              <Text style={t(styles.smallText, {
                color: theme.subtleText,
              })}>
                {'in '}
                <Text style={styles.boldedSmallText}>
                  {`r/${postDetails.subreddit}`}
                </Text>
                {' by '}
                <Text style={styles.boldedSmallText}>
                  {`u/${postDetails.author}`}
                </Text>
              </Text>
            </View>
            <View style={[styles.metadataRow, { marginTop: 5 }]}>
              <AntDesign name="arrowup" size={15} color={theme.subtleText} />
              <Text style={t(styles.smallText, {
                color: theme.subtleText,
              })}>
                {postDetails.voteCount}
              </Text>
              <Text style={t(styles.smallText, {
                color: theme.subtleText,
              })}>
                {'  •  '}
                {postDetails.timeSincePost}
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
      </>}
      <Comments comments={comments} scrollChange={scrollChange}/>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
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
