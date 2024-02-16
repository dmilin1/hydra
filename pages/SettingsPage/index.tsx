import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Feather, AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import { HistoryContext } from '../../contexts/HistoryContext';
import { Subreddit, getTrending } from '../../api/Subreddits';
import { SearchResult, SearchType, SearchTypes, getSearchResults } from '../../api/Search';
import { Post } from '../../api/Posts';
import PostComponent from '../../components/RedditDataRepresentations/Post/PostComponent';
import SubredditComponent from '../../components/RedditDataRepresentations/Subreddit/SubredditComponent';
import List from '../../components/UI/List';
import Scroller from '../../components/UI/Scroller';
import UserComponent from '../../components/RedditDataRepresentations/User/UserComponent';
import Root from './Root';
import URL from '../../utils/URL';
import Theme from './Theme';


export default function SettingsPage({ url }: { url: string }) {
  const { theme } = useContext(ThemeContext);
  const history = useContext(HistoryContext);

  const relativePath = new URL(url).getRelativePath();

  return (
    <View style={t(styles.settingsContainer, {
      backgroundColor: theme.background,
    })}>
      <ScrollView style={styles.scrollView}>
        {relativePath === 'settings' &&
          <Root/>
        }
        {relativePath === 'settings/theme' &&
          <Theme/>
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  }
});
