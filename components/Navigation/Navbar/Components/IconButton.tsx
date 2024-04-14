import React, { ReactNode, useContext } from 'react';
import { Share, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { ThemeContext, t } from '../../../../contexts/SettingsContexts/ThemeContext';
import { HistoryContext, HistoryLayer } from '../../../../contexts/HistoryContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RedditURL, { PageType } from '../../../../utils/RedditURL';

type IconButtonProps = {
  icon: ReactNode,
  justifyContent?: 'flex-start' | 'flex-end' | 'center',
  onPress?: () => void,
}

export default function IconButton({ icon, justifyContent, onPress }: IconButtonProps) {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={t(styles.sectionContainer, {
        justifyContent: justifyContent ?? 'center',
      })}
    >
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => onPress?.()}
        style={t(styles.touchableContainer, {
          color: onPress ? theme.buttonText : theme.text,
        })}
      >
        {icon}
      </TouchableOpacity>
    </View>
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
  touchableContainer: {
    paddingHorizontal: 5,
  },
});
