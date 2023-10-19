import React, { useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import DataRenderer from './DataRenderer';
import { RedditViewContext, RedditViewProvider } from '../contexts/RedditViewContext';
import { WebviewersContext } from '../contexts/WebViewContext';

export type RedditViewProps = {
  path: string,
  webviewerKey: string,
  reuseWebviewer?: boolean,
}

function RedditViewWithContext({ path, webviewerKey, reuseWebviewer }: RedditViewProps) {
  const redditViewContext = useContext(RedditViewContext);
  const { webviewers, addWebviewer, subscribeToWebviewer } = useContext(WebviewersContext);

  useEffect(() => {
    addWebviewer(webviewerKey, path);
    subscribeToWebviewer(webviewerKey, redditViewContext);
  }, []);

  return (
    <View style={styles.redditViewContainer}>
      <DataRenderer reuseWebviewer={reuseWebviewer}/>
    </View>
  );
}

export default function RedditView(props: RedditViewProps) {
  return (
    <RedditViewProvider>
      <RedditViewWithContext {...props}/>
    </RedditViewProvider>
  );
}

const styles = StyleSheet.create({
  redditViewContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1
  }
});
