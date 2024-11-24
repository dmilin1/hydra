import * as Haptics from "expo-haptics";
import {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  View,
  VirtualizedList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

import {
  ScrollerContext,
  ScrollerProvider,
} from "../../contexts/ScrollerContext";
import { t, ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

/**
 * Must use either the refresh or loadMore prop but not both. If using loadMore, the refresh
 * must be handled in the loadMore function.
 */
type ScrollerWithRefresh = {
  loadMore?: never;
  refresh: () => Promise<void>;
};

type ScrollerWithLoadMore = {
  loadMore: (refresh: boolean) => Promise<void>;
  refresh?: never;
};

type ScrollerProps = {
  headerComponent?: ReactNode | ReactNode[];
  beforeLoad?: ReactNode | ReactNode[];
  children: ReactNode | ReactNode[];
  scrollViewRef?: React.RefObject<VirtualizedList<ReactNode>>;
} & (ScrollerWithRefresh | ScrollerWithLoadMore);

function Scroller({
  beforeLoad,
  children,
  loadMore,
  refresh,
  scrollViewRef,
  headerComponent,
}: ScrollerProps) {
  const { theme } = useContext(ThemeContext);
  const { scrollDisabled } = useContext(ScrollerContext);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(!!loadMore);
  const [prevPageHeight, setPrevPageHeight] = useState(0);

  const loadMoreData = async (refresh = false) => {
    if (!loadMore) return;
    setIsLoadingMore(true);
    await loadMore(refresh);
    if (refresh) {
      setRefreshing(false);
    }
    setIsLoadingMore(false);
  };

  const refreshData = async () => {
    if (!refresh) return;
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMoreData();
  }, []);

  return (
    <VirtualizedList
      ref={scrollViewRef}
      scrollEnabled={!scrollDisabled}
      refreshControl={
        <RefreshControl
          tintColor={theme.text}
          refreshing={refreshing}
          onRefresh={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setRefreshing(true);
            if (loadMore) {
              setPrevPageHeight(0);
              loadMoreData(true);
            } else {
              refreshData();
            }
          }}
        />
      }
      scrollEventThrottle={100}
      onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const pageHeight = e.nativeEvent.contentSize.height;
        const windowHeight = e.nativeEvent.layoutMeasurement.height;
        const bottomOfWindow = e.nativeEvent.contentOffset.y + windowHeight;
        if (
          bottomOfWindow >=
            pageHeight -
              windowHeight * 1.5 /* 1.5 windows from bottom of page */ &&
          !isLoadingMore &&
          prevPageHeight !== pageHeight
        ) {
          setPrevPageHeight(pageHeight);
          loadMoreData();
        }
      }}
      /* Can't get this to work reliably but it's probably the proper way to do things */
      // onEndReachedThreshold={Dimensions.get('window').height * 1.5}
      // onEndReached={(e) => {
      //     if (e.distanceFromEnd < Dimensions.get('window').height * 1.5) {
      //         loadMoreData();
      //     }
      // }}
      data={Array.isArray(children) ? [...children, null] : [children]}
      renderItem={({ item }) => item as ReactElement}
      getItem={(data: ReactNode[], index: number) => data[index]}
      getItemCount={(data: ReactNode[]) => data.length}
      keyExtractor={(item: ReactNode, index: number) => {
        if (item) {
          return JSON.stringify((item as any).props, (key, value) => {
            return key !== "children" ? value : undefined;
          });
        }
        return index.toString();
      }}
      windowSize={4}
      ListHeaderComponent={
        <>
          {headerComponent}
          {isLoadingMore && !children && !refreshing && (
            <ActivityIndicator size="small" />
          )}
          {beforeLoad}
        </>
      }
      ListFooterComponent={
        <View style={styles.endOfListContainer}>
          {isLoadingMore ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={t(styles.endOfListText, {
                color: theme.text,
              })}
            >
              {children && `Wow. You've reached the bottom.`}
            </Text>
          )}
        </View>
      }
    />
  );
}

export default function WrappedScroller(props: ScrollerProps) {
  return (
    <ScrollerProvider>
      <Scroller {...props} />
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
