import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Feather, AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import { HistoryContext } from '../../contexts/HistoryContext';
import { Subreddit, getTrending } from '../../api/Subreddits';
import { SearchResult, SearchType, SearchTypes, getSearchResults } from '../../api/Search';
import { Post } from '../../api/Posts';
import SubredditComponent from '../../components/RedditDataRepresentations/Subreddit/SubredditComponent';
import List from '../../components/UI/List';
import Scroller from '../../components/UI/Scroller';
import UserComponent from '../../components/RedditDataRepresentations/User/UserComponent';


export default function Root() {
  const { theme } = useContext(ThemeContext);
  const history = useContext(HistoryContext);

  return <>
    <List
      title='General'
      items={[
        {
          key: 'theme',
          icon: <Feather name='moon' size={24} color={theme.text} />,
          text: 'Theme',
          onPress: () => history.pushPath('hydra://settings/theme'),
        },
        {
          key: 'account',
          icon: <FontAwesome5 name='user' size={24} color={theme.text} />,
          text: 'Account',
          onPress: () => history.pushPath('hydra://accounts'),
        },
      ]}
    />
  </>;
}

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  }
});
