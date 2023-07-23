import React from 'react';
import { StyleSheet, View } from 'react-native';

import WebViewer from './WebViewer';
import DataRenderer from './DataRenderer';
import { RedditViewProvider } from '../contexts/RedditViewContext';

export type RedditViewProps = {
  path: string,
}

export default function RedditView(props: RedditViewProps) {

  return (
    <RedditViewProvider>
      <View style={styles.redditViewContainer}>
        <DataRenderer/>
        <View /*style={{ display: 'flex', flex: 1, }}*/>
          <WebViewer {...props}/>
        </View>
      </View>
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
