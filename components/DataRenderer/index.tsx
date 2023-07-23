import React, { useContext } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import Posts from './Posts';
import { RedditViewContext } from '../../contexts/RedditViewContext';
import { RedditViewProps } from '../RedditView';


export default function DataRenderer() {
  const redditViewContext = useContext(RedditViewContext);
  const theme = useContext(ThemeContext);
  
  const componentsToRender = [];

  if (redditViewContext.posts.length > 0) {
    componentsToRender.push(<Posts/>);
  } else {
    componentsToRender.push(<ActivityIndicator size={'small'}/>);
  }

  return (
    <View
      style={t(styles.dataRendererContainer, {
        backgroundColor: theme.background,
      })}
    >
      {componentsToRender.map((component, index) => (
        <View
          key={index}
          style={styles.componentContainer}
        >
          {component}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dataRendererContainer: {
    flex: 1,
  },
  componentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
