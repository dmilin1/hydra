import React, { useContext, useEffect } from 'react';
import { StyleSheet, } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext, t } from '../../contexts/SettingsContexts/ThemeContext';
import { HistoryContext } from '../../contexts/HistoryContext';
import List from '../../components/UI/List';


export default function Root() {
  const { theme } = useContext(ThemeContext);
  const history = useContext(HistoryContext);

  return <>
    <List
      title='General'
      items={[
        {
          key: 'theme',
          icon: <Feather name='moon' size={24} color={theme.text} />,
          text: 'Theme',
          onPress: () => history.pushPath('hydra://settings/theme'),
        },
        {
          key: 'account',
          icon: <FontAwesome5 name='user' size={24} color={theme.text} />,
          text: 'Account',
          onPress: () => history.pushPath('hydra://accounts'),
        },
        {
          key: 'dataUse',
          icon: <Feather name='activity' size={24} color={theme.text} />,
          text: 'Data Use',
          onPress: () => history.pushPath('hydra://settings/dataUse'),
        },
      ]}
    />
  </>;
}

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  }
});
