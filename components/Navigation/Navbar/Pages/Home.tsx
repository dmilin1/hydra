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


export default function Home() {
  const history = useContext(HistoryContext);

  return (
    <>
      <DirectionButton direction='backward' />
      <TextButton text={history.past.slice(-1)[0]?.name}/>
      <SortAndContext
        sortOptions={['Best', 'Hot', 'New', 'Top', 'Rising']}
        contextOptions={['Share']}
      />
    </>
  );
}
