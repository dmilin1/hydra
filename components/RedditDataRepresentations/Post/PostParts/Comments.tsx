import React, { useContext, useState, useMemo, RefObject, Suspense } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, NativeTouchEvent, ScrollView, TouchableHighlight } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { ThemeContext, t } from '../../../../contexts/ThemeContext';
import RenderHtml from '../../../HTML/RenderHTML';
import { Comment, PostDetail, VoteOption, vote } from '../../../../api/PostDetail';
import { LoadMoreCommentsFunc } from '../../../../pages/PostDetails';
import { HistoryContext } from '../../../../contexts/HistoryContext';
import Slideable from '../../../UI/Slideable';

interface CommentProps {
  loadMoreComments?: LoadMoreCommentsFunc,
  comment: PostDetail|Comment,
  index: number,
  scrollChange?: (y: number) => void,
  displayInList?: boolean, // Changes render style for use in something like a list of user comments,
  changeComment: (comment: Comment) => void,
}

export function CommentComponent({ loadMoreComments, comment, index, scrollChange, displayInList, changeComment }: CommentProps) {
  const { theme } = useContext(ThemeContext);
  const history = useContext(HistoryContext);

  const commentRef = React.useRef<TouchableOpacity>(null);

  const [collapsed, setCollapsed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  return useMemo(() => (
    <View key={comment.id}>
      { comment.depth >= 0 && (
        <Slideable
          xScrollToEngage={15}
          left={[{
            icon: <AntDesign name="arrowup"/>,
            color: theme.upvote,
            action: async () => {
                if (comment.type === 'comment') {
                  const result = await vote(comment, VoteOption.UpVote);
                  changeComment?.({
                    ...comment,
                    userVote: result,
                    renderCount: comment.renderCount + 1,
                  })
                }
            },
          }, {
              icon: <AntDesign name="arrowdown"/>,
              color: theme.downvote,
              action: async () => {
                if (comment.type === 'comment') {
                  const result = await vote(comment, VoteOption.DownVote);
                  changeComment?.({
                    ...comment,
                    userVote: result,
                    renderCount: comment.renderCount + 1,
                  })
                }
              },
          }]}
        >
          <TouchableHighlight
            ref={commentRef}
            activeOpacity={1}
            underlayColor={theme.tint}
            onPress={e => {
              if (displayInList) {
                if (comment.type === 'comment') {
                  history.pushPath(comment.link);
                }
              } else {
                commentRef.current?.measure((fx, fy, width, height, px, py) => {
                  if (!collapsed && scrollChange) {
                    scrollChange(py);
                  }
                });
                setCollapsed(!collapsed)
              }
            }}
            style={t(
              styles.outerCommentContainer,
              displayInList ? styles.outerCommentContainerDisplayInList : {},
              {
                marginLeft: 10 * comment.depth,
                borderTopColor: theme.divider,
              }
            )}
          >
            <View
              key={index}
              style={t(styles.commentContainer, displayInList ? styles.commentContainerDisplayInList : {}, {
                borderLeftWidth: comment.depth === 0 ? 0 : 1,
                borderLeftColor: theme.postColorTint[(comment.depth - 1) % theme.postColorTint.length],
              })}
            >
              <View style={t(styles.topBar, {
                marginBottom: collapsed ? 0 : 8,
              })}>
                <Text style={t(styles.author, {
                  color: comment.isOP ? theme.buttonText : theme.text,
                })}>
                  {comment.author}
                </Text>
                <AntDesign
                  name={comment.userVote === VoteOption.DownVote ? 'arrowdown' : 'arrowup'}
                  size={14}
                  color={
                    comment.userVote === VoteOption.UpVote ? theme.upvote
                    : comment.userVote === VoteOption.DownVote ? theme.downvote
                    : theme.subtleText
                  }
                />
                <Text style={t(styles.upvoteText, {
                  color: comment.userVote === VoteOption.UpVote ? theme.upvote
                  : comment.userVote === VoteOption.DownVote ? theme.downvote
                  : theme.subtleText,
                })}>
                  {comment.upvotes}
                </Text>
                <Text style={t(styles.upvoteText, {
                  color: theme.subtleText,
                })}>
                  {'  ·  '}
                  {comment.timeSince}
                </Text>
              </View>
              { !collapsed ? (
                <View style={styles.textContainer}>
                  <RenderHtml html={comment.html} />
                </View>
              ) : null }
              {displayInList && (
                <TouchableOpacity
                  style={t(styles.sourceContainer, {
                  })}
                  activeOpacity={0.8}
                  onPress={() => {
                    history.pushPath(comment.postLink);
                  }}
                >
                  <Text style={t(styles.sourcePostTitle, {
                    color: theme.subtleText,
                  })}>
                    {comment.postTitle}
                  </Text>
                  <Text style={t(styles.sourceSubreddit, {
                    color: theme.verySubtleText,
                  })}>
                    {comment.subreddit}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableHighlight>
        </Slideable>
      )}
      { !collapsed ? (
        <>
          { comment.comments.length > 0 &&
            comment.comments.map((childComment, childIndex) => (
              <CommentComponent
                key={childComment.id}
                loadMoreComments={loadMoreComments}
                comment={childComment}
                index={childIndex}
                scrollChange={scrollChange}
                changeComment={changeComment}
              />
            ))
          }
          { comment.loadMore && comment.loadMore.childIds.length > 0 &&
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                setLoadingMore(true);
                if (comment.loadMore && loadMoreComments) {
                  await loadMoreComments(
                    comment.loadMore.childIds.slice(0, 5),
                    comment.path,
                    comment.comments.length,
                  );
                }
                setLoadingMore(false);
              }}
              style={t(styles.outerCommentContainer, {
                marginLeft: 10 * (comment.depth + 1),
                borderTopColor: theme.divider,
              })}
            >
              <View
                style={t(styles.commentContainer, {
                  borderLeftWidth: comment.depth === -1 ? 0 : 1,
                  borderLeftColor: theme.postColorTint[comment.depth % theme.postColorTint.length],
                })}
              >
                <Text style={t(styles.upvoteText, {
                  color: theme.buttonText,
                })}>
                  {loadingMore ? 'Loading...' : `${comment.loadMore.childIds.length} more replies` }
                </Text>
              </View>
            </TouchableOpacity>
          }
        </>
      ) : null}
      {displayInList && (
        <View
          style={t(styles.spacer, {
            backgroundColor: theme.tint,
          })}
        />
      )}
    </View>
  ), [loadingMore, collapsed, comment, comment.renderCount, theme]);
}

interface CommentsProps {
  loadMoreComments: LoadMoreCommentsFunc,
  postDetail: PostDetail,
  scrollChange: (y: number) => void,
  changeComment: (comment: Comment) => void,
}

export default function Comments({ loadMoreComments, postDetail, scrollChange, changeComment }: CommentsProps) {
  return (
    <View>
      <Suspense fallback={<View><Text>Loading</Text></View>}>
        <CommentComponent
          key={postDetail.id}
          loadMoreComments={loadMoreComments}
          comment={postDetail}
          index={0}
          scrollChange={scrollChange}
          changeComment={changeComment}
        />
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  outerCommentContainer: {
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  outerCommentContainerDisplayInList: {
    borderTopWidth: 0,
  },
  commentContainer: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 10,
  },
  commentContainerDisplayInList: {
    paddingLeft: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  upvoteText: {
    fontSize: 14,
  },
  textContainer: {
    marginVertical: -10,
  },
  sourceContainer: {
    marginTop: 15,
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
  },
  sourcePostTitle: {
    marginBottom: 10,
  },
  sourceSubreddit: {

  },
  text: {
    fontSize: 15,
    lineHeight: 18,
  },
  spacer: {
      height: 10,
  },
});
