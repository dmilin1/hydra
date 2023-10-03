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
          elem: <RedditView path='/r/CryptoCurrency/comments/16us3un/the_road_to_1m_tvl_on_the_mooneth_sushi_pool_part/'/>,
          name: 'Home',
        }]}
      />
    </SafeAreaView>
  );
}