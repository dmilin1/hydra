import React, { ReactNode, useContext } from 'react';
import { Share, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { ThemeContext, t } from '../../../../contexts/SettingsContexts/ThemeContext';
import { HistoryContext, HistoryLayer } from '../../../../contexts/HistoryContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RedditURL, { PageType } from '../../../../utils/RedditURL';

type SortTypes = 'Best' | 'Hot' | 'New' | 'Top' | 'Rising' | 'Controversial' | 'Old' | 'Q&A';

type ContextTypes = 'Share';

type SortAndContextProps = {
  sortOptions?: SortTypes[],
  contextOptions?: ContextTypes[],
}

export default function SortAndContext({ sortOptions, contextOptions }: SortAndContextProps) {
  const history = useContext(HistoryContext);
  const { theme } = useContext(ThemeContext);

  const { showActionSheetWithOptions } = useActionSheet();

  const currentPath = history.past.slice(-1)[0]?.elem.props.url;
  const pageType = new RedditURL(currentPath).getPageType();
  const currentSort = currentPath ? new RedditURL(currentPath).getSort() : null;

  const changeSort = (sort: string) => {
    const url = new RedditURL(currentPath).changeSort(sort).toString();
    history.replace(url);
  }

  const handleTopSort = () => {
    const options = ['Hour', 'Day', 'Week', 'Month', 'Year', 'All', 'Cancel'];
    const cancelButtonIndex = options.length;
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
      style={t(styles.sectionContainer, { justifyContent: 'flex-end' })}
    >
      {sortOptions &&
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            const cancelButtonIndex = sortOptions.length;
            showActionSheetWithOptions({
              options: [...sortOptions, 'Cancel'],
              cancelButtonIndex,
            }, (buttonIndex) => {
              if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return;
              let sort = sortOptions[buttonIndex];
              if (sort === 'Top' && [PageType.HOME, PageType.SUBREDDIT, PageType.USER].includes(pageType)) {
                handleTopSort();
                return;
              }
              changeSort(sort);
            });
          }}
        >
          {(currentSort === 'best' &&
            <AntDesign name="Trophy" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
          ) || (currentSort === 'hot' &&
            <SimpleLineIcons name='fire' size={24} color={theme.buttonText} style={{ marginRight: 20 }}/>
          ) || (currentSort === 'new' && 
          <AntDesign name="clockcircleo" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
          ) || (currentSort === 'top' && 
            <MaterialCommunityIcons name="podium-gold" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
          ) || (currentSort === 'rising' && 
            <MaterialIcons name="trending-up" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
          ) || (currentSort === 'controversial' && 
            <MaterialCommunityIcons  name="sword-cross" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
          ) || (currentSort === 'old' && 
            <MaterialCommunityIcons name="timer-sand-complete" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
          ) || (currentSort === 'qa' && 
          <AntDesign name="message1" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
          ) || (
            <AntDesign name="Trophy" size={24} color={theme.buttonText} style={{ marginRight: 20 }} />
          )}
        </TouchableOpacity>
      }
      {contextOptions &&
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            let cancelButtonIndex = contextOptions.length;
            showActionSheetWithOptions({
              options: [...contextOptions, 'Cancel'],
              cancelButtonIndex,
            }, (buttonIndex) => {
              if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return;
              if (contextOptions[buttonIndex] === 'Share') {
                Share.share({ url: new RedditURL(currentPath).toString() });
              }
            });
          }}
        >
          <Entypo name="dots-three-horizontal" size={24} color={theme.buttonText} style={{ paddingRight: 15 }}/>
        </TouchableOpacity>
      }
    </View>
  );
}

const styles = StyleSheet.create({
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
});
