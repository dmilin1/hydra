import React, { useContext, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRef } from 'react';
import { WebView } from 'react-native-webview';

import injectedJSBundle from './injected';
import DataHandler from './DataHandler';
import { RedditGlobalContext } from '../../contexts/RedditGlobalContext';
import { WebviewersContext } from '../../contexts/WebViewContext';

type WebViewerProps = {
  id: string,
  path: string,
  webviewRef: { elem: WebView|null },
}

export default function WebViewer({ id, path, webviewRef }: WebViewerProps) {
  const webview = useRef<WebView|null>(null);
  const redditGlobalContext = useContext(RedditGlobalContext);
  const { webviewers } = useContext(WebviewersContext);

  webviewRef.elem = webview.current;

  return (
    <WebView
      id={`webview-${id}`}
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
        [redditGlobalContext, ...webviewers[id].contextSubscribers],
        webview.current!,
        e
      )}
      onError={(e) => console.log(e)}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    
  }
});
