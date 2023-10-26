import React from 'react';
import { View, Text } from 'react-native';
import HistoryStack from '../../components/HistoryStack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Subreddits from '../../pages/Subreddits';
import PostList from '../../pages/Posts';


export default function Inbox() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <HistoryStack
        initialPast={[{
          elem: <PostList url='/best'/>,
          name: 'Home',
        }]}
      />
    </SafeAreaView>
  );
}