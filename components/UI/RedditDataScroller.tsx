import { FlashList, FlashListProps } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  View,
} from "react-native";

import { RedditDataObject } from "../../api/RedditApi";
import {
  ScrollerContext,
  ScrollerProvider,
} from "../../contexts/ScrollerContext";
import { t, ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

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
  scrollViewRef?: React.RefObject<FlashList<T>>;
  loadMore: (refresh: boolean) => Promise<void>;
  data: T[];
  fullyLoaded: boolean;
};

function RedditDataScroller<T extends RedditDataObject>(
  props: RedditDataScrollerProps<T>,
) {
  const { theme } = useContext(ThemeContext);
  const { scrollDisabled } = useContext(ScrollerContext);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(!!props.loadMore);

  const loadMoreData = async (refresh = false) => {
    if (!props.loadMore || props.fullyLoaded) return;
    setIsLoadingMore(true);
    await props.loadMore(refresh);
    if (refresh) {
      setRefreshing(false);
    }
    setIsLoadingMore(false);
  };

  useEffect(() => {
    loadMoreData();
  }, []);

  return (
    <FlashList<T>
      {...props}
      estimatedItemSize={300}
      scrollEnabled={!scrollDisabled}
      indicatorStyle={theme.systemModeStyle === "dark" ? "white" : "black"}
      refreshControl={
        <RefreshControl
          tintColor={theme.text}
          refreshing={refreshing}
          onRefresh={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setRefreshing(true);
            loadMoreData(true);
          }}
        />
      }
      scrollEventThrottle={100}
      onEndReachedThreshold={2}
      onEndReached={() => {
        loadMoreData();
      }}
      data={props.data}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      ListFooterComponent={
        <View style={styles.endOfListContainer}>
          {isLoadingMore && <ActivityIndicator size="small" />}
          {!isLoadingMore && !!props.data.length && (
            <Text
              style={t(styles.endOfListText, {
                color: theme.text,
              })}
            >
              {`Wow. You've reached the bottom.`}
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
  },
});
