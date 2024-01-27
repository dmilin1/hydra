import React, { useContext } from 'react';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ThemeContext } from '../../contexts/ThemeContext';
import Posts from './posts';
import Inbox from './inbox';
import Search from './search';
import Account from './account';
import { SafeAreaView } from 'react-native';



const Tab = createBottomTabNavigator();

export default function Tabs() {
  const theme = useContext(ThemeContext);

  const tabBarStyle = {
    backgroundColor: theme.background,
    borderTopWidth: 0,
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
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
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="post" size={size} color={color} />,
          }}
          component={Posts}
        />
        <Tab.Screen
          name="Inbox"
          options={{
            title: 'Inbox',
            headerShown: false,
            tabBarStyle,
            tabBarIcon: ({ color, size }) => <Entypo name="mail" size={size} color={color} />,
          }}
          component={Inbox}
        />
        <Tab.Screen
          name="Account"
          options={{
            title: 'Account',
            headerShown: false,
            tabBarStyle,
            tabBarIcon: ({ color, size }) => <MaterialIcons name="account-circle" size={size} color={color} />,
          }}
          component={Account}
        />
        <Tab.Screen
          name="Search"
          options={{
            title: 'Search',
            headerShown: false,
            tabBarStyle,
            tabBarIcon: ({ color, size }) => <AntDesign name="search1" size={size} color={color} />,
          }}
          component={Search}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}