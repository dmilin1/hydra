import React from 'react';
import { View, Text } from 'react-native';
import HistoryStack from '../../components/Navigation/HistoryStack';
import Subreddits from '../../pages/Subreddits';
import PostsPage from '../../pages/PostsPage';


export default function Inbox() {
  return (
    <HistoryStack
      initialPast={[{
        elem: <PostsPage url='https://www.reddit.com/best'/>,
        name: 'Home',
      }]}
    />
  );
}