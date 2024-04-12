import React, { useContext, useEffect } from 'react';
import { Text } from 'react-native';
import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ThemeContext } from '../../contexts/ThemeContext';
import Posts from './posts';
import Inbox from './inbox';
import Search from './search';
import Account from './account';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountContext } from '../../contexts/AccountContext';
import Settings from './settings';
import { getMessages } from '../../api/Messages';



const Tab = createBottomTabNavigator();

export default function Tabs() {
  const { theme } = useContext(ThemeContext);
  const { loginInitialized, currentUser } = useContext(AccountContext);

  const [inboxCount, setInboxCount] = React.useState(-1);

  const tabBarStyle = {
    backgroundColor: theme.background,
    borderTopWidth: 0,
  }

  const makeTabBarLabel = (label: string, focused: boolean) => (
    <Text style={{
      color: focused ? theme.buttonText : theme.subtleText,
      fontSize: 10,
    }}>
      {label}
    </Text>
  );

  // set up an interval to run every 30 seconds to check for new messages if the user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const checkForMessages = async () => {
      const messages = await getMessages();
      const newMessages = messages.filter(m => m.new);
      setInboxCount(newMessages.length);
    };
    const interval = setInterval(checkForMessages, 30000);
    checkForMessages();
    return () => clearInterval(interval);
  }, [currentUser]);
  
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={['right', 'top', 'left']}
    >
      { loginInitialized &&
        <Tab.Navigator
          initialRouteName="Posts"
          sceneContainerStyle={{ backgroundColor: theme.background }}
        >
          <Tab.Screen
            name="Posts"
            options={{
              title: 'Posts',
              headerShown: false,
              tabBarStyle,
              tabBarIcon: ({ focused, size }) => <MaterialCommunityIcons name="post" size={size} color={focused ? theme.iconPrimary : theme.subtleText} />,
              tabBarLabel: ({ focused }) => makeTabBarLabel('Posts', focused),
            }}
            component={Posts}
          />
          <Tab.Screen
            name="Inbox"
            options={{
              title: 'Inbox',
              headerShown: false,
              tabBarStyle,
              tabBarIcon: ({ focused, size }) => <Entypo name="mail" size={size} color={focused ? theme.iconPrimary : theme.subtleText} />,
              tabBarLabel: ({ focused }) => makeTabBarLabel('Inbox', focused),
              tabBarBadge: inboxCount > 0 ? inboxCount : undefined,
            }}
            component={Inbox}
          />
          <Tab.Screen
            name="Account"
            options={{
              title: currentUser?.userName ?? 'Accounts',
              headerShown: false,
              tabBarStyle,
              tabBarIcon: ({ focused, size }) => <MaterialIcons name="account-circle" size={size} color={focused ? theme.iconPrimary : theme.subtleText} />,
              tabBarLabel: ({ focused }) => makeTabBarLabel(currentUser?.userName ?? 'Account', focused),
            }}
            component={Account}
          />
          <Tab.Screen
            name="Search"
            options={{
              title: 'Search',
              headerShown: false,
              tabBarStyle,
              tabBarIcon: ({ focused, size }) => <AntDesign name="search1" size={size} color={focused ? theme.iconPrimary : theme.subtleText} />,
              tabBarLabel: ({ focused }) => makeTabBarLabel('Search', focused),
            }}
            component={Search}
          />
          <Tab.Screen
            name="Settings"
            options={{
              title: 'Settings',
              headerShown: false,
              tabBarStyle,
              tabBarIcon: ({ focused, size }) => <Ionicons name="settings-sharp" size={size} color={focused ? theme.iconPrimary : theme.subtleText} />,
              tabBarLabel: ({ focused }) => makeTabBarLabel('Settings', focused),
            }}
            component={Settings}
          />
        </Tab.Navigator>
      }
    </SafeAreaView>
  );
}