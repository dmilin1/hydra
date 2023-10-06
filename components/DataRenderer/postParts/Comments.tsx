import React, { useContext, useState, useMemo, RefObject } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, NativeTouchEvent, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Comment, RedditViewContext } from '../../../contexts/RedditViewContext';
import { ThemeContext, t } from '../../../contexts/ThemeContext';
import { set } from 'react-native-reanimated';
import RenderHtml from '../RenderHTML';

interface CommentProps {
  comment: Comment,
  index: number,
  scrollChange: (y: number) => void,
}

function CommentElem({ comment, index, scrollChange }: CommentProps) {
  const theme = useContext(ThemeContext);

  const [collapsed, setCollapsed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  return useMemo(() => (
    <View key={comment.id}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={e => {
          const target = e.target as unknown as View;
          target?.measure((fx, fy, width, height, px, py) => {
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
              {comment.voteCount}
              {'  ·  '}
            </Text>
            <Text style={t(styles.upvoteText, {
              color: theme.subtleText,
            })}>
              {comment.timeSinceComment}
            </Text>
          </View>
          { !collapsed ? (
            <View style={styles.textContainer}>
              <RenderHtml html={comment.html} />
            </View>
          ) : null }
        </View>
      </TouchableOpacity>
      { !collapsed ? (
        <>
          { comment.children.length > 0 &&
            comment.children.map((child, childIndex) => (
              <CommentElem
                key={child.id}
                comment={child}
                index={childIndex}
                scrollChange={scrollChange}
              />
            ))
          }
          { comment.loadMoreText &&
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                setLoadingMore(true);
                comment.loadMore()
              }}
              style={t(styles.outerCommentContainer, {
                marginLeft: 10 * (comment.depth + 1),
                borderBottomColor: theme.tint,
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
                  {loadingMore ? 'Loading...' : comment.loadMoreText?.trim()}
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
  comments: Comment[],
  scrollChange: (y: number) => void,
}

export default function Comments({ comments, scrollChange }: CommentsProps) {
  return (
    <View>
        {comments.map((comment, index) => (
          <CommentElem
            key={comment.id}
            comment={comment}
            index={index}
            scrollChange={scrollChange}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  outerCommentContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  commentContainer: {
    flex: 1,
    paddingLeft: 15,
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
