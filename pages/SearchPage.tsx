import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Feather, AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext, t } from '../contexts/ThemeContext';
import { HistoryContext } from '../contexts/HistoryContext';
import { Subreddit, getTrending } from '../api/Subreddits';
import { SearchType, SearchTypes, searchPosts, searchSubreddits } from '../api/Search';
import { Post } from '../api/Posts';
import PostComponent from '../components/RedditDataRepresentations/Post/PostComponent';
import SubredditComponent from '../components/RedditDataRepresentations/Subreddit/SubredditComponent';

export default function SearchPage() {
  const theme = useContext(ThemeContext);
  const history = useContext(HistoryContext);

  const [trending, setTrending] = useState<Subreddit[]>([]);
  const [search, setSearch] = useState<string>('');
  const [searchType, setSearchType] = useState<SearchType>('posts');
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>();
  const [subreddits, setSubreddits] = useState<Subreddit[]>();

  const doSearch = async () => {
    setPosts(undefined);
    setSubreddits(undefined);
    if (search) {
      setLoading(true);
      if (searchType === 'posts') {
        const posts = await searchPosts(search);
        setPosts(posts);
      } else if (searchType === 'subreddits') {
        const subreddits = await searchSubreddits(search);
        setSubreddits(subreddits);
      }
    }
    setLoading(false);
  }

  const loadTrending = async () => {
    const newTrending = await getTrending();
    setTrending(newTrending.filter(sub => !sub.subscribed && sub.name !== 'Home'));
  }

  useEffect(() => { loadTrending() }, []);

  useEffect(() => { doSearch() }, [searchType]);

  return (
    <View style={t(styles.searchContainer, {
      backgroundColor: theme.background,
    })}>
      <View style={styles.searchOptionsContainer}>
        {SearchTypes.map(type => (
          <TouchableOpacity
            key={type}
            style={t(styles.searchOption, {
              backgroundColor: searchType === type ? theme.tint : 'transparent',
            })}
            activeOpacity={0.8}
            onPress={() => setSearchType(type)}
          >
            <Text
              key={type}
              style={t(styles.searchOptionText, {
                color: theme.text,
              })}
            >
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={t(styles.searchBarContainer, {
        backgroundColor: theme.tint,
      })}>
        <AntDesign name="search1" size={18} color={theme.text} style={styles.searchBarIcon}/>
        <TextInput
          style={t(styles.searchBar, {
            color: theme.text,
          })}
          returnKeyType='search'
          value={search}
          onChangeText={setSearch}
          onBlur={() => doSearch()}
        />
      </View>
      <ScrollView style={t(styles.scrollView, {
        // backgroundColor: theme.background,
      })}>
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size='small' color={theme.text}/>
          </View>
        )}
        {!loading && (
          <>
            {posts && posts.map(post => (
              <PostComponent key={post.id} post={post}/>
            ))}
            {subreddits && subreddits.map(subreddit => (
              <SubredditComponent key={subreddit.id} subreddit={subreddit}/>
            ))}
            {!posts && !subreddits && (
              <>
                <Text style={t(styles.trendingTitle, {
                  color: theme.text,
                })}>
                  TRENDING SUBREDDITS
                </Text>
                <View style={t(styles.trendingContainer, {
                  backgroundColor: theme.tint,
                })}>
                {trending.map((sub, i) => (
                  <TouchableOpacity
                    key={sub.id}
                    onPress={() => history.pushPath(sub.url)}
                    activeOpacity={0.5}
                    style={t(styles.trendingButtonContainer, {
                      borderBottomColor: i < trending.length - 1 ? theme.divider : 'transparent',
                    })}
                  >
                    <View
                      style={styles.trendingButtonSubContainer}
                    >
                      <Feather name='trending-up' size={18} color={theme.text}/>
                      <Text style={t(styles.trendingButtonText, {
                        color: theme.text,
                      })}>
                        {sub.name}
                      </Text>
                      <MaterialIcons name='keyboard-arrow-right' size={22} color={theme.text}/>
                    </View>
                  </TouchableOpacity>
                ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
  },
  searchOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  searchOption: {
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  searchOptionText: {

  },
  searchBarContainer: {
    marginVertical: 10,
    marginHorizontal: 5,
    padding: 7,
    paddingLeft: 10,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBarIcon: {
    marginRight: 5,
  },
  searchBar: {
    flex: 1,
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    marginTop: 20,
  },
  trendingContainer: {
    flex: 1,
    marginHorizontal: 5,
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  trendingTitle: {
    marginTop: 15,
    marginBottom: 10,
    marginHorizontal: 25,
    fontSize: 14,
  },
  trendingButtonContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  },
  trendingButtonSubContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingButtonText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
});
