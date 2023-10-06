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
          elem: <RedditView path='/r/test/comments/170ser2/test/'/>,
          // elem: <RedditView path='/r/shacomains/comments/170zybr/saw_this_on_fb_and_thought_as_like_wait_a_fken/'/>,
          name: 'Home',
        }]}
      />
    </SafeAreaView>
  );
}