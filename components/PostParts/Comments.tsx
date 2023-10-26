import React, { useContext, useState, useMemo, RefObject } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, NativeTouchEvent, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import RenderHtml from '../RenderHTML';
import { Comment, PostDetail } from '../../api/PostDetail';
import { LoadMoreCommentsFunc } from '../../pages/PostDetails';

interface CommentProps {
  loadMoreComments: LoadMoreCommentsFunc,
  comment: Comment,
  index: number,
  scrollChange: (y: number) => void,
}

function CommentElem({ loadMoreComments, comment, index, scrollChange }: CommentProps) {
  const theme = useContext(ThemeContext);
  const commentRef = React.useRef<TouchableOpacity>(null);

  const [collapsed, setCollapsed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  return useMemo(() => (
    <View key={comment.id}>
      { comment.depth >= 0 && (
        <TouchableOpacity
          ref={commentRef}
          activeOpacity={1}
          onPress={e => {
            commentRef.current?.measure((fx, fy, width, height, px, py) => {
              const change = py - 150;
              if (change < 0 && !collapsed) {
                scrollChange(py - 150);
              }
            });
            setCollapsed(!collapsed)
          }}
          style={t(styles.outerCommentContainer, {
            marginLeft: 10 * comment.depth,
            borderTopColor: theme.tint,
          })}
        >
          <View
            key={index}
            style={t(styles.commentContainer, {
              borderLeftWidth: comment.depth === 0 ? 0 : 1,
              borderLeftColor: theme.postColorTint[(comment.depth - 1) % theme.postColorTint.length],
            })}
          >
            <View style={t(styles.topBar, {
              marginBottom: collapsed ? 0 : 8,
            })}>
              <Text style={t(styles.author, {
                color: theme.text,
              })}>
                {comment.author}
              </Text>
              <AntDesign name="arrowup" size={14} color={theme.subtleText}/>
              <Text style={t(styles.upvoteText, {
                color: theme.subtleText,
              })}>
                {comment.upvotes}
                {'  ·  '}
              </Text>
              <Text style={t(styles.upvoteText, {
                color: theme.subtleText,
              })}>
                {comment.timeSince}
              </Text>
            </View>
            { !collapsed ? (
              <View style={styles.textContainer}>
                <RenderHtml html={comment.html} />
              </View>
            ) : null }
          </View>
        </TouchableOpacity>
      )}
      { !collapsed ? (
        <>
          { comment.comments.length > 0 &&
            comment.comments.map((childComment, childIndex) => (
              <CommentElem
                key={childComment.id}
                loadMoreComments={loadMoreComments}
                comment={childComment}
                index={childIndex}
                scrollChange={scrollChange}
              />
            ))
          }
          { comment.loadMore && comment.loadMore.childIds.length > 0 &&
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                setLoadingMore(true);
                if (comment.loadMore) {
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
                borderTopColor: theme.tint,
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
    </View>
  ), [loadingMore, collapsed, comment, theme]);
}

interface CommentsProps {
  loadMoreComments: LoadMoreCommentsFunc,
  postDetail: PostDetail,
  scrollChange: (y: number) => void,
}

export default function Comments({ loadMoreComments, postDetail, scrollChange }: CommentsProps) {
  return (
    <View>
      <CommentElem
        key={postDetail.id}
        loadMoreComments={loadMoreComments}
        comment={postDetail}
        index={0}
        scrollChange={scrollChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerCommentContainer: {
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  commentContainer: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 10,
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
  text: {
    fontSize: 15,
    lineHeight: 18,
  },
});
