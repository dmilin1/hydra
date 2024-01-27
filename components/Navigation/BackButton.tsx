import React, { ReactNode, useContext } from 'react';
import { Share, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import { HistoryContext, HistoryLayer } from '../../contexts/HistoryContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RedditURL, { PageType } from '../../utils/RedditURL';


export default function BackButton() {
  const history = useContext(HistoryContext);
  const theme = useContext(ThemeContext);

  const onFirstLayer = history.past.length === 1;
  const prevPageName = history.past.slice(-2)[0]?.name;
  const prevPageUrl = history.past.slice(-2)[0]?.elem.props.url;
  const prevPageType = prevPageUrl ? (new RedditURL(prevPageUrl)).getPageType() : null;
  const currPageUrl = history.past.slice(-2)[0]?.elem.props.url;
  const currPageType = currPageUrl ? (new RedditURL(currPageUrl)).getPageType() : null;
  let showBackButton = true;
  let buttonText = null;

  if (currPageType === PageType.USER && onFirstLayer) {
    showBackButton = false;
    buttonText = 'Accounts';
  } else if (!onFirstLayer) {
    buttonText = prevPageName;
  }

  return buttonText ?
    <TouchableOpacity
      style={t(styles.sectionContainer, {
        justifyContent: 'flex-start',
        marginLeft: 10,
      })}
      activeOpacity={0.5}
      onPress={() => {
        if (currPageType === PageType.USER && onFirstLayer) {
          history.pushPath('hydra://accounts');
          return;
        }
        if (history.past.length > 1) {
          history.backward();
          return;
        }
      }}
    >
      {showBackButton ?
        <MaterialIcons
          name='keyboard-arrow-left'
          size={32}
          color={theme.buttonText}
          style={{ marginLeft: -10, marginRight: -5 }}
        />
      : null}
      <Text
        style={t(styles.sideText, {
          color: theme.buttonText,
          marginLeft: showBackButton ? 0 : 10,
        })}
      >
        {buttonText}
      </Text>
    </TouchableOpacity>
  : null
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
