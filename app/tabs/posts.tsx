import React from 'react';
import { View, Text } from 'react-native';
import HistoryStack from '../../components/Navigation/HistoryStack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Subreddits from '../../pages/Subreddits';
import PostsPage from '../../pages/PostsPage';
import PostDetails from '../../pages/PostDetails';


export default function Posts() {
  return (
    <HistoryStack
      initialPast={[{
        elem: <Subreddits/>,
        name: 'Subreddits',
      }, {
        elem: <PostsPage url='https://www.reddit.com/best'/>,
        name: 'Home',
      }]}
    />
  );
}