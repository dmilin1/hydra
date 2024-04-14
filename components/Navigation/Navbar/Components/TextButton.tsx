import React, { ReactNode, useContext } from 'react';
import { Share, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { ThemeContext, t } from '../../../../contexts/SettingsContexts/ThemeContext';
import { HistoryContext, HistoryLayer } from '../../../../contexts/HistoryContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RedditURL, { PageType } from '../../../../utils/RedditURL';

type TextButtonProps = {
  text: string,
  justifyContent?: 'flex-start' | 'flex-end' | 'center',
  onPress?: () => void,
}

export default function TextButton({ text, justifyContent, onPress }: TextButtonProps) {
  const history = useContext(HistoryContext);
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={t(styles.sectionContainer, {
        justifyContent: justifyContent ?? 'center',
      })}
      activeOpacity={0.5}
      onPress={() => onPress?.()}
    >
      <Text
        numberOfLines={1}
        style={t(styles.centerText, {
          color: onPress ? theme.buttonText : theme.text,
        })}
      >
        {text ?? history.past.slice(-1)[0]?.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  centerText: {
    paddingHorizontal: 5,
    fontSize: 17,
    fontWeight: '600',
  },
});
