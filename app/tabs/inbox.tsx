import React from 'react';
import { View, Text } from 'react-native';
import HistoryStack from '../../components/Navigation/HistoryStack';
import Subreddits from '../../pages/Subreddits';
import PostList from '../../pages/Posts';


export default function Inbox() {
  return (
    <HistoryStack
      initialPast={[{
        elem: <PostList url='https://www.reddit.com/best'/>,
        name: 'Home',
      }]}
    />
  );
}