import React from 'react';
import { StyleSheet } from 'react-native';
import { useRef } from 'react';
import { WebView } from 'react-native-webview';

import { Text, View } from '../Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import injectedJSBundle from './injectedjs';


export default function RedditView({ path }: { path: string }) {
  const webview = useRef<WebView|null>();


  console.log(injectedJSBundle);

  return (
    <SafeAreaView style={styles.redditViewContainer} edges={['top']}>
      <WebView
        ref={(ref) => webview.current = ref}
        style={styles.webview}
        source={{ uri: 'https://reddit.com' }}
        allowsBackForwardNavigationGestures={true}
        pullToRefreshEnabled={true}
        injectedJavaScript={`${String(injectedJSBundle)}; injectedJSBundle();`}
        onNavigationStateChange={(data) => {
          if (!data.loading) {
            webview.current?.injectJavaScript(injectedJSBundle);
          }
        }}
        onMessage={(e) => {
          const parsed = JSON.parse(e.nativeEvent.data);
          if (parsed.msg === 'log') {
            console.log(parsed.data);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  redditViewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  }
});
