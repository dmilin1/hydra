import WebView, { WebViewMessageEvent } from "react-native-webview";
import { RedditViewContextType } from "../../contexts/RedditViewContext";
import { RedditGlobalContextType } from '../../contexts/RedditGlobalContext';


export default function DataHandler(
  redditGlobalContext: RedditGlobalContextType,
  redditViewContext: RedditViewContextType,
  webview: WebView,
  e: WebViewMessageEvent
) {
  const { msg, data: arbitraryData } : {
    msg: string,
    data: any,
  } = JSON.parse(e.nativeEvent.data, (key, value) => {
    if (typeof value === 'string' && value.startsWith('[remote function]: ')) {
      const name = value.replace('[remote function]: ', '');
      return (...args: any[]) => webview.injectJavaScript(`window.RemoteFn.execute('${name}', \`${JSON.stringify(args)}\`)`);
    }
    return value;
  });
  if (msg === 'log') {
    console.log(arbitraryData);
  } else if (msg === 'posts') {
    const data = arbitraryData as Partial<RedditViewContextType>;
    redditViewContext.setPosts(data?.posts ?? []);
  } else if (msg === 'subscriptionList') {
    const data = arbitraryData as Partial<RedditGlobalContextType>;
    redditGlobalContext.setSubscriptionList(data?.subscriptionList ?? {});
  }
}
