import React, { ReactNode, useContext } from 'react';
import { Share, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { ThemeContext, t } from '../../../../contexts/ThemeContext';
import { HistoryContext, HistoryLayer } from '../../../../contexts/HistoryContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RedditURL, { PageType } from '../../../../utils/RedditURL';

type DirectionButtonProps = {
  direction: 'forward' | 'backward',
  showArrow?: boolean
}

export default function DirectionButton({ direction }: DirectionButtonProps) {
  const history = useContext(HistoryContext);
  const { theme } = useContext(ThemeContext);

  let btnText = null;
  let btnAction = () => {};
  if (direction === 'forward') {
    btnText = history.future.slice(-1)[0]?.name;
    btnAction = () => history.forward();
  } else if (direction === 'backward' && history.past.length > 1) {
    btnText = history.past.slice(-2)[0]?.name;
    btnAction = () => history.backward();
  }

  return (
    <TouchableOpacity
      style={t(styles.sectionContainer, {
        justifyContent: direction == 'backward' ? 'flex-start' : 'flex-end',
        marginLeft: 10,
      })}
      activeOpacity={0.5}
      onPress={() => btnAction()}
    >
      {btnText &&
        <>
          {direction === 'backward' ?
            <MaterialIcons
              name='keyboard-arrow-left'
              size={32}
              color={theme.buttonText}
              style={{ marginLeft: -10, marginRight: -5 }}
            />
          : null}
            <Text
              numberOfLines={1}
              style={t(styles.sideText, {
                color: theme.buttonText,
              })}
            >
              {btnText}
            </Text>
          {direction === 'forward' ?
            <MaterialIcons
              name='keyboard-arrow-right'
              size={32}
              color={theme.buttonText}
              style={{ marginRight: -10, marginLeft: -5 }}
            />
          : null}
        </>
      }
    </TouchableOpacity>
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
  sideText: {
    fontSize: 17,
    fontWeight: '400',
  },
  subredditForwardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
