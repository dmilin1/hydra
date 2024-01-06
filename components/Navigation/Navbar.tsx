import React, { useContext } from 'react';
import { Share, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import { HistoryContext } from '../../contexts/HistoryContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RedditURL, { PageType } from '../../utils/RedditURL';


export default function Navbar() {
  const history = useContext(HistoryContext);
  const theme = useContext(ThemeContext);

  const { showActionSheetWithOptions } = useActionSheet();

  const histLayer = history.past.slice(-1)[0];
  const currentPath = histLayer.elem.props.url;
  const currentSort = currentPath ? new RedditURL(currentPath).getSort() : null;

  let pageType = PageType.UNKNOWN;
  try {
    pageType = new RedditURL(currentPath).getPageType();
  } catch {}

  let sortOptionsPages = [
    PageType.HOME,
    PageType.POST_DETAILS,
    PageType.SUBREDDIT,
  ];

  const changeSort = (sort: string) => {
    const url = new RedditURL(currentPath).changeSort(sort).toString();
    history.replace(url);
  }

  const handleTopSort = () => {
    const options = ['Hour', 'Day', 'Week', 'Month', 'Year', 'All', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    showActionSheetWithOptions({
      options: ['Hour', 'Day', 'Week', 'Month', 'Year', 'All', 'Cancel'],
      cancelButtonIndex,
    }, (buttonIndex) => {
      if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return;
      const url = new RedditURL(currentPath)
        .changeSort('top')
        .changeQueryParam('t', options[buttonIndex].toLowerCase())
        .toString();
      history.replace(url);
    });
  }

  return (
    <View
      style={t(styles.navbarContainer, {
        backgroundColor: theme.background,
        borderBottomColor: theme.tint,
      })}
    >
      <TouchableOpacity
        style={t(styles.sectionContainer, {
          justifyContent: 'flex-start',
          marginLeft: 10,
        })}
        activeOpacity={0.5}
        onPress={() => {
          if (history.past.length > 1) {
            history.backward()
          }
        }}
      >
        {history.past.length > 1 && <>
          <MaterialIcons
            name='keyboard-arrow-left'
            size={32}
            color={theme.buttonText}
            style={{ marginLeft: -10, marginRight: -5 }}
          />
          <Text
            style={t(styles.sideText, {
              color: theme.buttonText,
            })}
          >
            {history.past.slice(-2)[0]?.name}
          </Text>
        </>}
      </TouchableOpacity>
      <View style={styles.sectionContainer}>
        <Text
          numberOfLines={1}
          style={t(styles.centerText, {
            color: theme.text,
          })}
        >
          {history.past.slice(-1)[0]?.name}
        </Text>
      </View>
      <View style={t(styles.sectionContainer, { justifyContent: 'flex-end' })}>
        { sortOptionsPages.includes(pageType) &&
          <>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                let sortOptions : string[] = [];
                if (pageType === PageType.HOME) {
                  sortOptions = ['Best', 'Hot', 'New', 'Top', 'Rising', 'Cancel'];
                } else if (pageType === PageType.POST_DETAILS) {
                  sortOptions = ['Best', 'New', 'Top', 'Controversial', 'Old', 'Q&A', 'Cancel'];
                } else if (pageType === PageType.SUBREDDIT) {
                  sortOptions = ['Hot', 'New', 'Top', 'Rising', 'Cancel'];
                }
                const cancelButtonIndex = sortOptions.length - 1;
                showActionSheetWithOptions({
                  options: sortOptions,
                  cancelButtonIndex,
                }, (buttonIndex) => {
                  if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return;
                  let sort = sortOptions[buttonIndex];
                  if (sort === 'Top' && [PageType.HOME, PageType.SUBREDDIT].includes(pageType)) {
                    handleTopSort();
                    return;
                  }
                  if (sort === 'Q&A') {
                    sort = 'qa';
                  }
                  changeSort(sort);
                });
              }}
            >
              {(currentSort === 'best' &&
                <AntDesign name="Trophy" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
              ) || (currentSort === 'hot' &&
                <SimpleLineIcons name='fire' size={24} color={theme.buttonText} style={{ marginRight: 20 }}/>
              ) || (currentSort === 'top' && 
                <MaterialCommunityIcons name="podium-gold" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
              ) || (currentSort === 'new' && 
                <AntDesign name="clockcircleo" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
              ) || (currentSort === 'rising' && 
                <MaterialIcons name="trending-up" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
              ) || (currentSort === 'old' && 
                <MaterialCommunityIcons name="timer-sand-complete" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
              ) || (currentSort === 'qa' && 
              <AntDesign name="message1" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
              ) || (
                <AntDesign name="Trophy" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                const sortOptions = ['Share', 'Cancel'];
                let cancelButtonIndex = sortOptions.length - 1;
                showActionSheetWithOptions({
                  options: sortOptions,
                  cancelButtonIndex,
                }, (buttonIndex) => {
                  if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return;
                  if (sortOptions[buttonIndex] === 'Share') {
                    Share.share({ url: currentPath, message: 'derpity derp dorp' })
                  }
                });
              }}
            >
              <Entypo name="dots-three-horizontal" size={24} color={theme.buttonText} style={{ paddingRight: 15 }}/>
            </TouchableOpacity>
          </>
        }
        { histLayer.elem.type.name === 'Subreddits' &&
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              history.forward();
            }}
            style={styles.subredditForwardContainer}
          >
            <Text
              style={t(styles.sideText, {
                color: theme.buttonText,
              })}
            >
              {history.future.slice(-1)[0]?.name}
            </Text>
            <MaterialIcons
              name='keyboard-arrow-right'
              size={32}
              color={theme.buttonText}
              style={{ marginLeft: -5 }}
            />
          </TouchableOpacity>
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  sectionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  centerText: {
    fontSize: 17,
    fontWeight: '600',
  },
  sideText: {
    fontSize: 17,
    fontWeight: '400',
  },
  subredditForwardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
