import { StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Text, View, VirtualizedList, Dimensions } from "react-native"
import { t, ThemeContext } from "../../contexts/ThemeContext"
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { ScrollerContext, ScrollerProvider } from "../../contexts/ScrollerContext";

type ScrollerProps = {
    beforeLoad?: ReactNode|ReactNode[],
    children: ReactNode|ReactNode[],
    loadMore?: (refresh: boolean) => Promise<void>,
    scrollViewRef?: React.RefObject<VirtualizedList<unknown>>,
}

function Scroller({ beforeLoad, children, loadMore, scrollViewRef } : ScrollerProps) {
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

    useEffect(() => { loadMoreData() }, []);

    return (
        <VirtualizedList
            ref={scrollViewRef}
            scrollEnabled={!scrollDisabled}
            refreshControl={
                <RefreshControl
                    tintColor={theme.text}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        loadMoreData(true);
                    }}
                />
            }
            scrollEventThrottle={100}
            onScroll={(e) => {
                const pageHeight = e.nativeEvent.contentSize.height;
                const windowHeight = e.nativeEvent.layoutMeasurement.height;
                const bottomOfWindow = e.nativeEvent.contentOffset.y + windowHeight;
                if (
                    bottomOfWindow >= pageHeight - windowHeight * 1.5 /* 1.5 windows from bottom of page */
                    && !isLoadingMore
                    && prevPageHeight !== pageHeight
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
            renderItem={({ item }) => item as any}
            getItem={(data, index) => data[index]}
            getItemCount={(data) => data.length}
            keyExtractor={(item, index) => {
                if (item) {
                    return JSON.stringify((item as any).props, (key, value) => {
                        return key !== 'children' ? value : undefined;
                    });
                }
                return index.toString();
            }}
            windowSize={4}
            ListHeaderComponent={
                <>
                    {isLoadingMore && !children && !refreshing &&
                        <ActivityIndicator size={'small'}/>
                    }
                    {beforeLoad}
                </>
            }
            ListFooterComponent={
                <View style={styles.endOfListContainer}>
                    {isLoadingMore ? (
                        <ActivityIndicator size={'small'}/>
                    ) : (
                        <Text style={t(styles.endOfListText, {
                            color: theme.text,
                        })}>
                            {children && `Wow. You've reached the bottom.`}
                        </Text>
                    )}
                </View>
            }
        />
    );
}

export default function WrappedScroller(props : ScrollerProps) {
    return (
        <ScrollerProvider>
            <Scroller {...props}/>
        </ScrollerProvider>
    );
}

const styles = StyleSheet.create({
    endOfListContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 75,
    },
    endOfListText: {
        fontSize: 14,
    }
});
  