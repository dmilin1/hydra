import React, { useContext } from 'react';
import HistoryStack from '../../components/Navigation/HistoryStack';
import UserPage from '../../pages/UserPage';
import { AccountContext } from '../../contexts/AccountContext';
import AccountsPage from '../../pages/AccountsPage';


export default function Account() {
  const { currentUser } = useContext(AccountContext);

  return currentUser ? (
    <HistoryStack
      key={currentUser.id}
      initialPast={[{
        elem: <UserPage url='https://www.reddit.com/user/me'/>,
        name: 'dmilin',
      }]}
    />
  ) : (
    <HistoryStack
      key={'logged out'}
      initialPast={[{
        elem: <AccountsPage />,
        name: 'Accounts',
      }]}
    />
  );
}