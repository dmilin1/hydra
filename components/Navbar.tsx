import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { ThemeContext, t } from '../contexts/ThemeContext';
import { HistoryContext } from '../contexts/HistoryContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RedditURL from '../utils/RedditURL';
import { WebviewersContext } from '../contexts/WebViewContext';


export default function Navbar() {
  const history = useContext(HistoryContext);
  const { getCurrentWebview } = useContext(WebviewersContext);
  const theme = useContext(ThemeContext);

  const { showActionSheetWithOptions } = useActionSheet();

  const histLayer = history.past.slice(-1)[0];
  const currentPath = histLayer.elem.props.path;

  const changeSort = (sort: string) => {
    console.log(new RedditURL(currentPath).changeSort(sort).getRelativePath());
    history.replace(new RedditURL(currentPath).changeSort(sort).getRelativePath());
    // console.log(new RedditURL(currentPath).changeSort(sort));
  }

  return (
    <View
      style={t(styles.navbarContainer, {
        backgroundColor: theme.background,
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
        { histLayer.elem.type.name === 'RedditView' &&
          <>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                const sortOptions = ['Hot', 'New', 'Top', 'Rising', 'Cancel'];
                if (!currentPath.includes('/r/') && !currentPath.includes('/u/')) {
                  sortOptions.unshift('Best');
                }
                showActionSheetWithOptions({
                  options: sortOptions,
                  cancelButtonIndex: 4,
                }, (buttonIndex) => {
                  if (buttonIndex === undefined || buttonIndex === 4) return;
                  changeSort(sortOptions[buttonIndex]);
                });
              }}
            >
              <SimpleLineIcons name='fire' size={24} color={theme.buttonText} style={{ marginRight: 20 }}/>
            </TouchableOpacity>
            <Entypo name="dots-three-horizontal" size={24} color={theme.buttonText} style={{ paddingRight: 15 }}/>
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
