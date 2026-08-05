import { useContext, useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";

import { Comment, PostDetail } from "../../api/PostDetail";
import { CommentsHandle } from "../../components/RedditDataRepresentations/Post/PostParts/Comments";
import { ScrollToNextButtonContext } from "../../contexts/ScrollToNextButtonContext";
import { getCommentFromPath } from "../../utils/commentTree";

const FUZZY_DISTANCE = 5;

// Fabric never fires the measure callback for nodes detached from the shadow
// tree, so every measurement races a timeout to avoid hanging forever.
const MEASURE_TIMEOUT_MS = 500;

function measurePageY(
  node: { measure: MeasureFunc } | null | undefined,
): Promise<number | null> {
  return new Promise((resolve) => {
    if (!node) return resolve(null);
    setTimeout(() => resolve(null), MEASURE_TIMEOUT_MS);
    node.measure((_x, _y, _width, _height, _pageX, pageY) => resolve(pageY));
  });
}

function measureWindowY(
  node: { measureInWindow: MeasureInWindowFunc } | null | undefined,
): Promise<number | null> {
  return new Promise((resolve) => {
    if (!node) return resolve(null);
    setTimeout(() => resolve(null), MEASURE_TIMEOUT_MS);
    node.measureInWindow((_x, y) => resolve(y));
  });
}

type MeasureFunc = (
  callback: (
    x: number,
    y: number,
    width: number,
    height: number,
    pageX: number,
    pageY: number,
  ) => void,
) => void;

type MeasureInWindowFunc = (
  callback: (x: number, y: number, width: number, height: number) => void,
) => void;

// React Native's ScrollView type doesn't declare the measure methods even
// though the instance has them at runtime.
type MeasurableScrollView = ScrollView & {
  measure: MeasureFunc;
  measureInWindow: MeasureInWindowFunc;
};

export default function useCommentScrolling(
  postDetail: PostDetail | undefined,
  changeComment: (comment: Comment | PostDetail) => void,
) {
  const { setScrollToNext, setScrollToPrevious } = useContext(
    ScrollToNextButtonContext,
  );

  const scrollView = useRef<MeasurableScrollView>(null);
  const topOfScroll = useRef<View>(null);
  const commentsHandle = useRef<CommentsHandle>(null);

  /**
   * If a comment is tapped closed above the current scroll position, scroll
   * up to it so the visible content doesn't jump.
   */
  const scrollChange = async (changeY: number) => {
    const scrollRef = scrollView.current;
    if (!scrollRef) return;
    const scrollWindowTop = await measurePageY(scrollRef);
    if (scrollWindowTop === null || changeY >= scrollWindowTop) return;
    const scrollDepth = await measurePageY(topOfScroll.current);
    if (scrollDepth === null) return;
    scrollRef.scrollTo({
      y: scrollWindowTop - scrollDepth + (changeY - scrollWindowTop),
      animated: true,
    });
  };

  const scrollToNextComment = async (goPrevious = false) => {
    const handle = commentsHandle.current;
    const scrollRef = scrollView.current;
    if (!handle || !scrollRef) return;
    const [scrollY, topY] = await Promise.all([
      measureWindowY(scrollRef),
      measureWindowY(topOfScroll.current),
    ]);
    if (scrollY === null || topY === null) return;
    const commentYs = await Promise.all(
      handle.getTopLevelNodes().map(({ node }) => measureWindowY(node)),
    );
    let prevDelta = 0;
    for (const commentY of commentYs) {
      if (commentY === null) continue;
      const delta = commentY - topY;
      if (
        commentY > scrollY &&
        !(Math.abs(commentY - scrollY) < FUZZY_DISTANCE)
      ) {
        scrollRef.scrollTo({
          y: goPrevious ? prevDelta : delta,
          animated: true,
        });
        break;
      }
      if (commentY < scrollY - FUZZY_DISTANCE) {
        prevDelta = delta;
      }
    }
  };

  const collapseThread = async (comment: Comment) => {
    if (!postDetail) return;
    const topOfThread = getCommentFromPath(
      postDetail,
      comment.path.slice(0, 1),
    );
    if (!topOfThread) return;
    const [threadY, topY] = await Promise.all([
      measureWindowY(commentsHandle.current?.getTopLevelNode(topOfThread.id)),
      measureWindowY(topOfScroll.current),
    ]);
    if (threadY !== null && topY !== null) {
      scrollView.current?.scrollTo({ y: threadY - topY, animated: true });
    }
    changeComment({ ...topOfThread, collapsed: true });
  };

  // Registered once: the closures only read refs, which stay current.
  useEffect(() => {
    setScrollToNext(() => scrollToNextComment());
    setScrollToPrevious(() => scrollToNextComment(true));
  }, []);

  return {
    scrollView,
    topOfScroll,
    commentsHandle,
    scrollChange,
    collapseThread,
  };
}
