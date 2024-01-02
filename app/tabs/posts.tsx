import React from 'react';
import { View, Text } from 'react-native';
import HistoryStack from '../../components/Navigation/HistoryStack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Subreddits from '../../pages/Subreddits';
import PostList from '../../pages/Posts';
import PostDetails from '../../pages/PostDetails';


export default function Posts() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <HistoryStack
        initialPast={[{
          elem: <Subreddits/>,
          name: 'Subreddits',
        }, {
          elem: <PostList url='https://www.reddit.com/best'/>,
          // elem: <PostDetails url='https://www.reddit.com/r/AskReddit/comments/17bdut1/what_is_the_fashion_trend_that_you_cant_stand_but/'/>,
          // elem: <PostDetails url='https://www.reddit.com/r/shacomains/comments/17hn6h4/shaco_still_sucks/'/>,
          // elem: <PostList url='https://www.reddit.com/r/Sexy/'/>,
          // elem: <RedditView path='/r/shacomains/comments/170zybr/saw_this_on_fb_and_thought_as_like_wait_a_fken/'/>,
          name: 'Home',
        }]}
      />
    </SafeAreaView>
  );
}