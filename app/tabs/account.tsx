import React from 'react';
import HistoryStack from '../../components/Navigation/HistoryStack';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchPage from '../../pages/SearchPage';


export default function Account() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <HistoryStack
        initialPast={[{
          elem: <SearchPage/>,
          name: 'Search',
        }]}
      />
    </SafeAreaView>
  );
}