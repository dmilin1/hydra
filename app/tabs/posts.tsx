import React from 'react';
import { View, Text } from 'react-native';
import HistoryStack from '../../components/HistoryStack';
import RedditView from '../../components/RedditView';
import { SafeAreaView } from 'react-native-safe-area-context';
import Subreddits from '../../components/Subreddits';


export default function Posts() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <HistoryStack
        initialPast={[{
          elem: <Subreddits/>,
          name: 'Subreddits',
        }, {
          elem: <RedditView path=''/>,
          name: 'Home',
        }]}
      />
    </SafeAreaView>
  );
}