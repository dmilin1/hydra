import React, { useContext, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRef } from 'react';
import { WebView } from 'react-native-webview';

import injectedJSBundle from './injected';
import { RedditViewContext } from '../../contexts/RedditViewContext';
import DataHandler from './DataHandler';
import { RedditGlobalContext } from '../../contexts/RedditGlobalContext';
import { RedditViewProps } from '../RedditView';


export default function WebViewer({ path }: RedditViewProps) {
  const webview = useRef<WebView|null>();
  const redditGlobalContext = useContext(RedditGlobalContext);
  const redditViewContext = useContext(RedditViewContext);

  useEffect(() => {
    redditViewContext.setWebview(webview.current!);
  }, []);

  return (
    <WebView
      ref={(ref) => webview.current = ref}
      style={styles.webview}
      source={{ uri: `https://reddit.com${path ?? '/'}` }}
      originWhitelist={['*']}
      allowsBackForwardNavigationGestures={true}
      pullToRefreshEnabled={true}
      contentMode={'desktop'}
      userAgent='Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
      // injectedJavaScript={`${String(injectedJSBundle)}; injectedJSBundle();`}
      allowsInlineMediaPlayback={true}
      onNavigationStateChange={(data) => {
        if (!data.loading) {
          webview.current?.injectJavaScript(injectedJSBundle);
        }
      }}
      onMessage={(e) => DataHandler(
        redditGlobalContext,
        redditViewContext,
        webview.current!,
        e
      )}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  }
});
