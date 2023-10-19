import WebView, { WebViewMessageEvent } from "react-native-webview";
import { RedditViewContextType } from "../../contexts/RedditViewContext";
import { RedditGlobalContextType } from '../../contexts/RedditGlobalContext';


export default function DataHandler(
  contexts: (RedditGlobalContextType|RedditViewContextType)[],
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

  contexts.forEach(context => {
    if (msg === 'log') {
      console.log(arbitraryData);
    }
    if (context.type === 'globalContext') {
      context = context as RedditGlobalContextType;
      if (msg === 'subscriptionList') {
        const data = arbitraryData as Partial<RedditGlobalContextType>;
        context.setSubscriptionList(data?.subscriptionList ?? {});
      }
    }
    if (context.type === 'viewContext') {
      context = context as RedditViewContextType;
      if (msg === 'posts') {
        const data = arbitraryData as Partial<RedditViewContextType>;
        context.setPosts(data?.posts ?? []);
      } else if (msg === 'comments') {
        const data = arbitraryData as Partial<RedditViewContextType>;
        context.setComments(data?.comments ?? []);
      } else if (msg === 'postDetails') {
        const data = arbitraryData as Partial<RedditViewContextType>;
        context.setPostDetails(data?.postDetails ?? null);
      }
    }
  });
}
