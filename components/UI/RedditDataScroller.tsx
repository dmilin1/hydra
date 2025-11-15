import { FlashList, FlashListProps } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useContext, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  View,
  ColorValue,
} from "react-native";

import { RedditDataObject } from "../../api/RedditApi";
import {
  ScrollerContext,
  ScrollerProvider,
} from "../../contexts/ScrollerContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { TabScrollContext } from "../../contexts/TabScrollContext";
import { modifyStat, Stat } from "../../db/functions/Stats";

/**
 * Future note for when I'm an idiot and the scroller gets all glitchy again.
 * None of the components rendered by the scroller should create a new state
 * from the data passed into them. For example, adding something like this to
 * the PostComponent would cause the scroller to glitch. Let the parent that
 * wraps the scroller handle data modifications. State changes can be issued
 * to the parent.
 *
 * const [post, setPost] = useState(initialPostState); // BAD
 *
 * Also, elements rendered by the scroller should not change their height or
 * everything gets fucked.
 */

type OverridableFlashListProps<T> = Omit<
  FlashListProps<T>,
  "data" | "getItem" | "getItemCount"
>;

type RedditDataScrollerProps<T> = OverridableFlashListProps<T> & {
  scrollViewRef?: React.RefObject<typeof FlashList<T>>;
  showInitialLoader?: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  data: T[];
  fullyLoaded: boolean;
  hitFilterLimit: boolean;
};

function RedditDataScroller<T extends RedditDataObject>(
  props: RedditDataScrollerProps<T>,
) {
  const { theme } = useContext(ThemeContext);
  const { scrollDisabled } = useContext(ScrollerContext);
  const { handleScrollForTabBar } = useContext(TabScrollContext);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(
    props.showInitialLoader ?? true,
  );

  const lastScrollPosition = useRef(0);

  const loadMoreData = async (refresh = false) => {
    if (props.fullyLoaded && !refresh) return;
    setIsLoadingMore(true);
    if (refresh) {
      await props.refresh();
      setRefreshing(false);
    } else {
      await props.loadMore();
    }
    setIsLoadingMore(false);
  };

  /**
   * The tintColor prop on the RefreshControl component is broken in React Native 0.81.5.
   * This is a workaround to fix the bug. Same fix is used in the PostDetails component.
   * https://github.com/facebook/react-native/issues/53987
   */
  const [refreshControlColor, setRefreshControlColor] = useState<ColorValue>();
  useEffect(() => {
    setTimeout(() => {
      setRefreshControlColor(theme.text);
    }, 500);
  }, []);

  return (
    <FlashList<T>
      {...props}
      scrollEnabled={!scrollDisabled}
      indicatorStyle={theme.systemModeStyle === "dark" ? "white" : "black"}
      refreshControl={
        <RefreshControl
          style={{ backgroundColor: "red" }}
          tintColor={refreshControlColor}
          refreshing={refreshing}
          onRefresh={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setRefreshing(true);
            loadMoreData(true);
          }}
        />
      }
      scrollEventThrottle={100}
      onScroll={(e) => {
        handleScrollForTabBar(e);
        const scrollPosition = e.nativeEvent.contentOffset.y;
        modifyStat(
          Stat.SCROLL_DISTANCE,
          Math.abs(scrollPosition - lastScrollPosition.current),
        );
        lastScrollPosition.current = scrollPosition;
      }}
      onEndReachedThreshold={2}
      onEndReached={() => {
        loadMoreData();
      }}
      data={props.data}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      ListFooterComponent={
        <View style={styles.endOfListContainer}>
          {isLoadingMore && <ActivityIndicator size="small" />}
          {!isLoadingMore && props.fullyLoaded && !!props.data.length && (
            <Text
              style={[
                styles.endOfListText,
                {
                  color: theme.text,
                },
              ]}
            >
              {`Wow. You've reached the bottom.`}
            </Text>
          )}
          {!isLoadingMore && props.hitFilterLimit && (
            <Text
              style={[
                styles.endOfListText,
                {
                  color: theme.text,
                },
              ]}
            >
              The filter limit has been reached. Your filters may be too strict
              to show anything.
            </Text>
          )}
        </View>
      }
    />
  );
}

export default function WrappedScroller<T extends RedditDataObject>(
  props: RedditDataScrollerProps<T>,
) {
  return (
    <ScrollerProvider>
      <RedditDataScroller<T> {...props} />
    </ScrollerProvider>
  );
}

const styles = StyleSheet.create({
  endOfListContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 75,
  },
  endOfListText: {
    fontSize: 14,
    marginHorizontal: 10,
  },
});
