import React from 'react';
import HistoryStack from '../../components/Navigation/HistoryStack';
import UserPage from '../../pages/UserPage';


export default function Account() {
  return (
    <HistoryStack
      initialPast={[{
        elem: <UserPage url='https://www.reddit.com/user/me'/>,
        name: 'dmilin',
      }]}
    />
  );
}