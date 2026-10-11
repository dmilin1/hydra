import Ionicons from "@react-native-vector-icons/ionicons";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import { Touchable } from "react-native-gesture-handler";

import {
  summarizePostComments,
  summarizePostDetails,
} from "../../../../api/AI";
import { PostDetail } from "../../../../api/PostDetail";
import { CommentSettingsContext } from "../../../../contexts/SettingsContexts/CommentSettingsContext";
import { PostSettingsContext } from "../../../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../../../contexts/SubscriptionsContext";

export type Summary = {
  status: "idle" | "loading" | "loaded" | "error";
  text: string | null;
  startCollapsed: boolean;
  load: () => void;
};

type SummaryState = Pick<Summary, "status" | "text">;

const IDLE: SummaryState = { status: "idle", text: null };

export function usePostSummaries(postDetail: PostDetail): {
  postSummary: Summary | null;
  commentsSummary: Summary | null;
} {
  const { isPro, customerId } = useContext(SubscriptionsContext);
  const { showPostSummary, collapsePostSummary } =
    useContext(PostSettingsContext);
  const { showCommentSummary, collapseCommentSummary } = useContext(
    CommentSettingsContext,
  );

  const [{ postSummaryEligible, commentsSummaryEligible }] = useState(() => ({
    postSummaryEligible: showPostSummary && postDetail.text.length > 850,
    commentsSummaryEligible:
      showCommentSummary &&
      postDetail.comments.reduce(
        (acc, comment) => acc + comment.text.length,
        0,
      ) > 1_000,
  }));

  const [postSummary, setPostSummary] = useState<SummaryState>(IDLE);
  const [commentsSummary, setCommentsSummary] = useState<SummaryState>(IDLE);

  const fetchPostSummary = async (proCustomerId: string) => {
    setPostSummary({ status: "loading", text: null });
    try {
      const text = await summarizePostDetails(proCustomerId, postDetail);
      setPostSummary({ status: "loaded", text });
      return text;
    } catch (_) {
      setPostSummary({ status: "error", text: null });
      return null;
    }
  };

  const fetchCommentsSummary = async (
    proCustomerId: string,
    postSummaryText: string | null,
  ) => {
    setCommentsSummary({ status: "loading", text: null });
    try {
      const text = await summarizePostComments(
        proCustomerId,
        postDetail,
        postSummaryText ?? postDetail.text,
      );
      setCommentsSummary({ status: "loaded", text });
    } catch (_) {
      setCommentsSummary({ status: "error", text: null });
    }
  };

  const loadPostSummary = () => {
    if (postSummary.status !== "idle" && postSummary.status !== "error") return;
    if (!customerId) return;
    fetchPostSummary(customerId);
  };

  const loadCommentsSummary = () => {
    if (commentsSummary.status !== "idle" && commentsSummary.status !== "error")
      return;
    if (!customerId) return;
    fetchCommentsSummary(
      customerId,
      postSummary.status === "loaded" ? postSummary.text : null,
    );
  };

  /**
   * This all seems a bit weird, but it's because we want to fetch the post
   * summary first when possible so that we can use that for the comments
   * summary to reduce the amount of context we have to send to it.
   */
  useEffect(() => {
    if (!isPro || !customerId) return;
    const fetchEagerSummaries = async () => {
      let postSummaryText: string | null = null;
      if (postSummaryEligible && !collapsePostSummary) {
        postSummaryText = await fetchPostSummary(customerId);
      }
      if (commentsSummaryEligible && !collapseCommentSummary) {
        await fetchCommentsSummary(customerId, postSummaryText);
      }
    };
    fetchEagerSummaries();
  }, []);

  return {
    postSummary: postSummaryEligible
      ? {
          ...postSummary,
          startCollapsed: collapsePostSummary,
          load: loadPostSummary,
        }
      : null,
    commentsSummary: commentsSummaryEligible
      ? {
          ...commentsSummary,
          startCollapsed: collapseCommentSummary,
          load: loadCommentsSummary,
        }
      : null,
  };
}

function SummaryBody({
  summary,
  textStyle,
}: {
  summary: Summary;
  textStyle: TextStyle;
}) {
  const { theme } = useContext(ThemeContext);

  return summary.status === "loading" ? (
    <ActivityIndicator size="small" style={styles.summaryLoader} />
  ) : (
    <Text style={[textStyle, { color: theme.subtleText }]}>
      {summary.status === "error" ? "Failed to load summary." : summary.text}
    </Text>
  );
}

export function PostSummary({ summary }: { summary: Summary | null }) {
  const { theme } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(summary?.startCollapsed ?? false);

  const toggleCollapsed = () => {
    if (collapsed) {
      summary?.load();
    }
    setCollapsed(!collapsed);
  };

  const visible =
    summary &&
    (summary.startCollapsed || (summary.status === "loaded" && summary.text));

  return visible ? (
    <Touchable
      activeOpacity={1}
      underlayColor={theme.tint}
      onPress={toggleCollapsed}
      style={[
        styles.postSummaryContainer,
        {
          borderColor: theme.divider,
        },
      ]}
    >
      <View>
        <View
          style={[
            styles.postSummaryTitleRow,
            {
              marginBottom: !collapsed ? 5 : 0,
            },
          ]}
        >
          <Text
            style={[
              styles.postSummaryTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Summary
          </Text>
          {collapsed && (
            <Ionicons name="chevron-down" size={16} color={theme.subtleText} />
          )}
        </View>
        {!collapsed && summary && (
          <SummaryBody summary={summary} textStyle={styles.postSummaryText} />
        )}
      </View>
    </Touchable>
  ) : null;
}

export function CommentsSummary({ summary }: { summary: Summary | null }) {
  const { theme } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(summary?.startCollapsed ?? false);

  const toggleCollapsed = () => {
    if (collapsed) {
      summary?.load();
    }
    setCollapsed(!collapsed);
  };

  const visible =
    summary &&
    (summary.startCollapsed || (summary.status === "loaded" && summary.text));

  return visible ? (
    <Touchable
      activeOpacity={1}
      underlayColor={theme.tint}
      onPress={toggleCollapsed}
      style={[
        styles.commentsSummaryContainer,
        {
          borderTopColor: theme.divider,
        },
      ]}
    >
      <View>
        <View style={styles.commentsSummaryTitleRow}>
          <Text
            style={[
              styles.commentsSummaryTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Comments Summary
          </Text>
          {collapsed && (
            <Ionicons name="chevron-down" size={14} color={theme.subtleText} />
          )}
        </View>
        {!collapsed && summary && (
          <SummaryBody
            summary={summary}
            textStyle={styles.commentsSummaryText}
          />
        )}
      </View>
    </Touchable>
  ) : null;
}

const styles = StyleSheet.create({
  postSummaryContainer: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 3,
  },
  postSummaryTitleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  postSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  postSummaryText: {
    fontSize: 15,
  },
  commentsSummaryContainer: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  commentsSummaryTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentsSummaryTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  commentsSummaryText: {
    marginTop: 8,
    fontSize: 15,
  },
  summaryLoader: {
    marginTop: 8,
  },
});
