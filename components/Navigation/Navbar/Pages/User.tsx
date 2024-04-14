import React, { ReactNode, useContext } from 'react';
import { Share, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { ThemeContext, t } from '../../../../contexts/SettingsContexts/ThemeContext';
import { HistoryContext, HistoryLayer } from '../../../../contexts/HistoryContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RedditURL, { PageType } from '../../../../utils/RedditURL';
import DirectionButton from '../Components/DirectionButton';
import TextButton from '../Components/TextButton';
import SortAndContext from '../Components/SortAndContext';
import URL from '../../../../utils/URL';


export default function User() {
  const history = useContext(HistoryContext);

  const path = history.past.slice(-1)[0].elem.props.url;
  const section = new URL(path).getRelativePath().split('/')[3];

  return (
    <>
      {history.past.length === 1 ? (
        <TextButton
          text='Accounts'
          justifyContent='flex-start'
          onPress={() => history.pushPath('hydra://accounts')}
        />
      ) : (
        <DirectionButton direction='backward' />
      )}
      <TextButton text={history.past.slice(-1)[0]?.name}/>
      <SortAndContext
        sortOptions={
          section === 'submitted' || section === 'comments'
          ? ['New', 'Hot', 'Top']
          : undefined
        }
        contextOptions={['Share']}
      />
    </>
  );
}
