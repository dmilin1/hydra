import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { FontAwesome5 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { RedditGlobalContext } from '../contexts/RedditGlobalContext';
import { ThemeContext, t } from '../contexts/ThemeContext';
import { HistoryContext } from '../contexts/HistoryContext';


export default function Subreddits() {
  const theme = useContext(ThemeContext);
  const redditGlobalContext = useContext(RedditGlobalContext);
  const history = useContext(HistoryContext);

  return (
    <View style={styles.subredditsContainer}>
      <ScrollView style={t(styles.scrollView, {
        backgroundColor: theme.background,
      })}>
        {[{
          title: 'Home',
          path: '',
          description: 'Posts from subscriptions',
          icon: <FontAwesome5 name="home" size={24} color={theme.text} />,
          color: '#fa045e',
        }, {
          title: 'Popular',
          path: '/r/popular',
          description: 'Most popular posts across Reddit',
          icon: <Feather name="trending-up" size={24} color={theme.text} />,
          color: '#008ffe',
        }, {
          title: 'All',
          path: '/r/all',
          description: 'Posts across all subreddits',
          icon: <FontAwesome5 name="sort-amount-up-alt" size={24} color={theme.text} />,
          color: '#02d82b',
        }].map(link => (
          <TouchableOpacity
            key={link.title}
            onPress={() => history.pushPath(link.path)}
            activeOpacity={0.5}
            style={t(styles.bigButtonContainer, {
              borderBottomColor: theme.tint,
            })}
          >
            <View
              key={link.path}
              style={t(styles.bigButtonSubContainer, {
                borderBottomColor: theme.tint,
              })}
            >
              <View style={t(styles.bigButtonIconContainer, {
                backgroundColor: link.color,
              })}>
                {link.icon}
              </View>
              <View>
                <Text style={t(styles.subredditText, {
                  color: theme.text,
                })}>
                  {link.title}
                </Text>
                <Text style={t(styles.subredditDescription, {
                  color: theme.subtleText,
                })}>
                  {link.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {Object.entries(redditGlobalContext.subscriptionList)
        .filter(([category, _]) =>
          ['moderating', 'your communities', 'Custom feeds'].includes(category)
        ).map(([category, subreddits]) => (
          <View key={category}>
            {subreddits.length > 0 && <View style={styles.categoryContainer}>
              <View style={t(styles.categoryTitleContainer, {
                backgroundColor: theme.tint,
              })}>
                <Text style={t(styles.categoryTitle, {
                  color: theme.text,
                })}>{category.toUpperCase()}</Text>
              </View>
              {subreddits.map((subreddit) => (
                <TouchableHighlight
                  key={subreddit.subreddit}
                  onPress={() => history.pushPath(subreddit.url)}
                  activeOpacity={0.5}
                  style={t(styles.subredditContainer, {
                    borderBottomColor: theme.tint,
                  })}
                >
                  <Text style={t(styles.subredditText, {
                    color: theme.text,
                  })}>
                    {subreddit.subreddit}
                  </Text>
                </TouchableHighlight>
              ))}
            </View>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bigButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  },
  bigButtonSubContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  bigButtonIconContainer: {
    width: 45,
    height: 45,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  subredditsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {

  },
  categoryTitleContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  categoryTitle: {

  },
  subredditContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  },
  subredditText: {
    fontSize: 16,
  },
  subredditDescription: {
    fontSize: 12,
    marginTop: 5,
  }
});
