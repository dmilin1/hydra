import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Comment, PostDetail } from "../../api/PostDetail";
import { searchPostComments } from "../../api/gql/Search";
import { CommentComponent } from "../../components/RedditDataRepresentations/Post/PostParts/Comments";
import MoreRepliesRow from "../../components/RedditDataRepresentations/Post/PostParts/Comments/MoreRepliesRow";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

export const MIN_COMMENT_SEARCH_LENGTH = 3;

type CommentSearchResultsProps = {
  postDetail: PostDetail;
  /** Trimmed, at least MIN_COMMENT_SEARCH_LENGTH long. Key the component by it. */
  query: string;
};

/**
 * A post's comments matching the query, searched by Reddit across the whole
 * thread. Tapping one opens it in its thread, like a user page's comments.
 */
export default function CommentSearchResults({
  postDetail,
  query,
}: CommentSearchResultsProps) {
  const { theme } = useContext(ThemeContext);

  const [comments, setComments] = useState<Comment[]>([]);
  // The next page's; undefined on the last.
  const [cursor, setCursor] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = async (after?: string) => {
    setLoading(true);
    setError(undefined);
    try {
      const page = await searchPostComments(postDetail, query, after);
      setComments((old) => [...old, ...page.comments]);
      setCursor(page.cursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeResult = (newComment: Comment) =>
    setComments((old) =>
      old.map((c) => (c.name === newComment.name ? newComment : c)),
    );

  const deleteResult = (comment: Comment) =>
    setComments((old) => old.filter((c) => c.name !== comment.name));

  const message = error
    ? `Couldn't search comments: ${error}`
    : !loading && comments.length === 0
      ? `No comments match "${query}"`
      : null;

  return (
    <View>
      {comments.map((comment) => (
        <CommentComponent
          key={comment.name}
          comment={comment}
          displayInList
          hidePostLink
          changeComment={changeResult}
          deleteComment={deleteResult}
        />
      ))}
      {loading ? (
        <ActivityIndicator size="small" style={styles.footer} />
      ) : message ? (
        <Text style={[styles.footer, styles.message, { color: theme.text }]}>
          {message}
        </Text>
      ) : cursor ? (
        <MoreRepliesRow
          depth={-1}
          theme={theme}
          label="Load more results"
          onPress={() => load(cursor)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginVertical: 25,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginHorizontal: 20,
  },
});
