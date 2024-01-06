import React from 'react';
import HistoryStack from '../../components/Navigation/HistoryStack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountPage from '../../pages/AccountPage';


export default function Account() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <HistoryStack
        initialPast={[{
          elem: <AccountPage url='https://www.reddit.com/user/dmilin'/>,
          name: 'dmilin',
        }]}
      />
    </SafeAreaView>
  );
}