import React, { useContext } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import Posts from './Posts';
import { RedditViewContext } from '../../contexts/RedditViewContext';
import PostDetails from './PostDetails';

type DataRendererProps = {
  reuseWebviewer?: boolean,
}

export default function DataRenderer({ reuseWebviewer }: DataRendererProps) {
  const redditViewContext = useContext(RedditViewContext);
  const theme = useContext(ThemeContext);
  
  const componentsToRender = [];

  if (reuseWebviewer && redditViewContext.comments.length > 0) {
    componentsToRender.push(<PostDetails/>);
  } else if (redditViewContext.posts.length > 0) {
    componentsToRender.push(<Posts/>);
  } else if (redditViewContext.comments.length > 0) {
    componentsToRender.push(<PostDetails/>);
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
    alignItems: 'stretch',
    justifyContent: 'center',
  }
});
