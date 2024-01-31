import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeContext, t } from '../../../contexts/ThemeContext';
import { HistoryContext } from '../../../contexts/HistoryContext';
import RedditURL, { PageType } from '../../../utils/RedditURL';
import Default from './Pages/Default';
import Home from './Pages/Home';
import Subreddit from './Pages/Subreddit';
import PostDetails from './Pages/PostDetails';
import User from './Pages/User';


export default function Navbar() {
  const history = useContext(HistoryContext);
  const theme = useContext(ThemeContext);

  const histLayer = history.past.slice(-1)[0];
  const currentPath = histLayer.elem.props.url;

  let pageType = PageType.UNKNOWN;
  try {
    pageType = new RedditURL(currentPath).getPageType();
  } catch {}

  let ContentComponent = null;

  if (pageType === PageType.UNKNOWN) {
    ContentComponent = Default;
  } else if (pageType === PageType.HOME) {
    ContentComponent = Home;
  } else if (pageType === PageType.SUBREDDIT) {
    ContentComponent = Subreddit;
  } else if (pageType === PageType.POST_DETAILS) {
    ContentComponent = PostDetails;
  } else if (pageType === PageType.USER) {
    ContentComponent = User;
  } else {
    ContentComponent = Default;
  }

  return (
    <View
      style={t(styles.navbarContainer, {
        backgroundColor: theme.background,
        borderBottomColor: theme.tint,
      })}
    >
      <ContentComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
});
