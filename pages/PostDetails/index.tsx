import { useContext, useDeferredValue, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ColorValue,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CommentSearchResults, {
  MIN_COMMENT_SEARCH_LENGTH,
} from "./CommentSearchResults";
import useCommentScrolling from "./useCommentScrolling";
import usePostDetail from "./usePostDetail";
import { StackPageProps } from "../../app/stack";
import PostDetailsComponent from "../../components/RedditDataRepresentations/Post/PostDetailsComponent";
import Comments from "../../components/RedditDataRepresentations/Post/PostParts/Comments";
import ScrollToNextButtonProvider from "../../contexts/ScrollToNextButtonProvider";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { TabScrollContext } from "../../contexts/TabScrollContext";
import {
  TabBarScrollView,
  TabBarSpacer,
} from "../../contexts/TabBarInsetsContext";
import AccessFailureComponent from "../../components/UI/AccessFailureComponent";
import SearchBar from "../../components/UI/SearchBar";
import RedditURL from "../../utils/RedditURL";

type PostDetailsProps =
  | StackPageProps<"PostDetailsPage">
  | {
      splitViewURL: string;
      setSplitViewURL: (url: string | null) => void;
    };

function PostDetails(props: PostDetailsProps) {
  const url = "route" in props ? props.route.params.url : props.splitViewURL;
  const isSplitView = "splitViewURL" in props && !!props.splitViewURL;

  const { theme } = useContext(ThemeContext);
  const { handleScrollForTabBar } = useContext(TabScrollContext);

  const {
    postDetail,
    setPostDetail,
    loadError,
    refreshing,
    loadPostDetails,
    changeComment,
    deleteComment,
    loadMoreComments,
  } = usePostDetail(url, isSplitView);

  // Lets the post render immediately while a large comment tree mounts.
  const deferredPostDetail = useDeferredValue(postDetail);

  const {
    scrollView,
    topOfScroll,
    commentsHandle,
    scrollChange,
    collapseThread,
    scrollToTop,
  } = useCommentScrolling(postDetail, changeComment);

  const [commentSearch, setCommentSearch] = useState("");
  // Split view reuses this page for the next post.
  useEffect(() => setCommentSearch(""), [url]);
  const trimmedSearch = commentSearch.trim();
  const isSearching = trimmedSearch.length >= MIN_COMMENT_SEARCH_LENGTH;

  /**
   * The tintColor prop on the RefreshControl component is broken in React
   * Native 0.81.5. This is a workaround to fix the bug. Same fix is used in
   * the RedditDataScroller component.
   * https://github.com/facebook/react-native/issues/53987
   */
  const [refreshControlColor, setRefreshControlColor] = useState<ColorValue>();
  useEffect(() => {
    setTimeout(() => {
      setRefreshControlColor(theme.text);
    }, 500);
  }, []);

  return (
    <View style={styles.postDetailsOuterContainer}>
      {postDetail ? (
        <TabBarScrollView
          ref={scrollView}
          refreshControl={
            <RefreshControl
              tintColor={refreshControlColor}
              refreshing={refreshing}
              onRefresh={() => loadPostDetails()}
            />
          }
          onScroll={(e) => handleScrollForTabBar(e)}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            // Room for the scroll-to-next button; TabBarSpacer clears the tab bar
            paddingBottom: 60,
          }}
        >
          <View ref={topOfScroll} />
          {postDetail.commentCount > 0 && (
            <SearchBar
              key={url}
              placeholder="Search comments"
              searchOnBlur={false}
              onSearch={setCommentSearch}
            />
          )}
          {isSearching ? (
            <CommentSearchResults
              // A new search starts over.
              key={`${postDetail.id}:${trimmedSearch}`}
              postDetail={postDetail}
              query={trimmedSearch}
            />
          ) : (
            <>
              <PostDetailsComponent
                key={postDetail.id}
                postDetail={postDetail}
                loadPostDetails={loadPostDetails}
                setPostDetail={setPostDetail}
                onCollapse={scrollToTop}
              />
              {deferredPostDetail && deferredPostDetail.comments.length > 0 ? (
                <Comments
                  key={`${deferredPostDetail.id}-comments`}
                  ref={commentsHandle}
                  loadMoreComments={loadMoreComments}
                  postDetail={deferredPostDetail}
                  scrollChange={scrollChange}
                  changeComment={changeComment}
                  deleteComment={deleteComment}
                  collapseThread={collapseThread}
                  interactionDisabledStatus={
                    postDetail.interactionDisabledStatus
                  }
                />
              ) : postDetail !== deferredPostDetail ? (
                <View key="loading-comments" style={styles.commentsPlaceholder}>
                  <ActivityIndicator size="small" />
                </View>
              ) : (
                <View key="no-comments" style={styles.commentsPlaceholder}>
                  <Text
                    style={[
                      styles.noCommentsText,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    No comments
                  </Text>
                </View>
              )}
            </>
          )}
          <TabBarSpacer />
        </TabBarScrollView>
      ) : loadError ? (
        <AccessFailureComponent
          accessFailure={loadError}
          contentName={new RedditURL(url).getSubreddit()}
        />
      ) : (
        <ActivityIndicator size="small" />
      )}
    </View>
  );
}

export default function PostDetailsPage(props: PostDetailsProps) {
  return (
    <ScrollToNextButtonProvider>
      <PostDetails {...props} />
    </ScrollToNextButtonProvider>
  );
}

const styles = StyleSheet.create({
  postDetailsOuterContainer: {
    flex: 1,
    justifyContent: "center",
  },
  commentsPlaceholder: {
    marginVertical: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  noCommentsText: {
    fontSize: 15,
  },
});
