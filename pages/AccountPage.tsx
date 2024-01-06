import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Feather, AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext, t } from '../contexts/ThemeContext';
import { HistoryContext } from '../contexts/HistoryContext';
import PostComponent from '../components/RedditDataRepresentations/Post/PostComponent';
import SubredditComponent from '../components/RedditDataRepresentations/Subreddit/SubredditComponent';
import { User, UserContent, getUser, getUserContent } from '../api/User';
import Numbers from '../utils/Numbers';
import List from '../components/UI/List';
import { Post } from '../api/Posts';
import { CommentComponent } from '../components/RedditDataRepresentations/Post/PostParts/Comments';
import SectionTitle from '../components/UI/SectionTitle';
import URL from '../utils/URL';
import Scroller from '../components/UI/Scroller';

type AccountPageProps = {
  url: string,
}

export default function AccountPage({ url } : AccountPageProps) {
  const theme = useContext(ThemeContext);
  const history = useContext(HistoryContext);

  const [user, setUser] = useState<User>();
  const [userContent, setUserContent] = useState<UserContent[]>([]);

  const isDeepPath = !!new URL(url).getBasePath().split('/')[5]; // More than just /user/username like /user/username/comments

  const pushUserPath = (path: string) => {
    const fullPath = new URL(url).getBasePath().split('/').slice(0, 5).join('/') + path;
    history.pushPath(fullPath);
  }

  const loadUser = async () => {
    const userData = await getUser(url);
    setUser(userData);
  }

  const loadUserContent = async (refresh = false) => {
    const newContent = await getUserContent(url, {
      after: refresh ? undefined : userContent.slice(-1)[0]?.after
    });
    if (refresh) {
      setUserContent(newContent);
    } else {
      setUserContent([...userContent, ...newContent]);
    }
  }

  useEffect(() => {
    if (!isDeepPath) {
      loadUser();
    }
  }, []);

  return (
    <View style={t(styles.userContainer, {
      backgroundColor: theme.background,
    })}>
      <Scroller
        loadMore={loadUserContent}
      >
        <View>
          {user && 
            <>
              <View style={styles.statsContainer}>
                {[{
                  statName: 'Comment\nKarma',
                  statValue: new Numbers(user.commentKarma).prettyNum(),
                }, {
                  statName: 'Post\nKarma',
                  statValue: new Numbers(user.commentKarma).prettyNum(),
                }, {
                  statName: 'Account\nAge',
                  statValue: new Numbers(user.commentKarma).prettyNum(),
                }].map(stat => (
                  <View style={styles.statContainer} key={stat.statName}>
                    <Text style={t(styles.statsNum, {
                      color: theme.text,
                    })}>
                      {stat.statValue}
                    </Text>
                    <Text style={t(styles.statsDescription, {
                      color: theme.verySubtleText,
                    })}>
                      {stat.statName}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.buttonsContainer}>
                <List items={[{
                  key: 'posts',
                  icon: <Feather name='file-text' size={24} color={theme.iconPrimary}/>,
                  text: 'Posts',
                  onPress: () => pushUserPath('/submitted'),
                }, {
                  key: 'comments',
                  icon: <FontAwesome5 name='comment' size={24} color={theme.iconPrimary}/>,
                  text: 'Comments',
                  onPress: () => pushUserPath('/comments'),
                },
                ...(user.isLoggedInUser ? [{
                  key: 'upvoted',
                  icon: <Feather name='thumbs-up' size={24} color={theme.iconPrimary}/>,
                  text: 'Upvoted',
                  onPress: () => pushUserPath('/upvoted'),
                }, {
                  key: 'downvoted',
                  icon: <Feather name='thumbs-down' size={24} color={theme.iconPrimary}/>,
                  text: 'Downvoted',
                  onPress: () => pushUserPath('/downvoted'),
                }, {
                  key: 'hidden',
                  icon: <Feather name='eye-off' size={24} color={theme.iconPrimary}/>,
                  text: 'Hidden',
                  onPress: () => pushUserPath('/hidden'),
                }, {
                  key: 'saved',
                  icon: <Feather name='bookmark' size={24} color={theme.iconPrimary}/>,
                  text: 'Saved',
                  onPress: () => pushUserPath('/saved'),
                }] : [])
                ]}/>
              </View>
            </>
          }
          {userContent && userContent.map((content: UserContent) => {
            if (content.type === 'post') {
              return (
                <PostComponent
                  key={content.id}
                  post={content}
                />
              );
            }
            if (content.type === 'comment') {
              return (
                <CommentComponent
                  key={content.id}
                  comment={content}
                  index={0}
                  displayInList={true}
                />
              );
            }
          })}
        </View>
      </Scroller>
    </View>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    marginTop: 20,
  },
  buttonsContainer: {
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 25,
  },
  statContainer: {
    alignItems: 'center',
  },
  statsNum: {
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 5,
  },
  statsDescription: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 14,
  }
});
