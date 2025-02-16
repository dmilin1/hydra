import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { User, UserContent, getUser, getUserContent } from "../api/User";
import { StackPageProps } from "../app/stack";
import SortAndContext, {
  ContextTypes,
  SortTypes,
} from "../components/Navbar/SortAndContext";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import { CommentComponent } from "../components/RedditDataRepresentations/Post/PostParts/Comments";
import UserDetailsComponent from "../components/RedditDataRepresentations/User/UserDetailsComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import { AccountContext } from "../contexts/AccountContext";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../utils/RedditURL";
import URL from "../utils/URL";
import { useURLNavigation } from "../utils/navigation";
import useRedditDataState from "../utils/useRedditDataState";

export default function UserPage({ route }: StackPageProps<"UserPage">) {
  const url = route.params.url;

  const navigation = useURLNavigation();

  const section = new RedditURL(url).getRelativePath().split("/")[3];

  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);

  const [user, setUser] = useState<User>();

  const {
    data: userContent,
    setData: setUserContent,
    modifyData: modifyUserContent,
    deleteData: deleteUserContent,
    fullyLoaded,
  } = useRedditDataState<UserContent>();

  const isDeepPath = !!new URL(url).getBasePath().split("/")[5]; // More than just /user/username like /user/username/comments

  const loadUser = async () => {
    const userUrl = new RedditURL(url)
      .getRelativePath()
      .split("/")
      .slice(0, 3)
      .join("/");
    const userData = await getUser(`https://www.reddit.com${userUrl}`);
    setUser(userData);
    const contextOptions: ContextTypes[] = ["Share"];
    if (currentUser?.userName !== userData.userName) {
      contextOptions.unshift("Message");
    }
    const sortOptions: SortTypes[] | undefined =
      section === "submitted" || section === "comments"
        ? ["New", "Hot", "Top"]
        : undefined;
    navigation.setOptions({
      headerRight: () => {
        return (
          <SortAndContext
            route={route}
            navigation={navigation}
            sortOptions={sortOptions}
            contextOptions={contextOptions}
            pageData={userData}
          />
        );
      },
    });
  };

  const loadUserContent = async (refresh = false) => {
    const newContent = await getUserContent(url, {
      after: refresh ? undefined : userContent.slice(-1)[0]?.after,
    });
    if (refresh) {
      setUserContent(newContent);
    } else {
      setUserContent([...userContent, ...newContent]);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <View
      style={t(styles.userContainer, {
        backgroundColor: theme.background,
      })}
    >
      <RedditDataScroller
        ListHeaderComponent={() =>
          !isDeepPath && user && <UserDetailsComponent user={user} />
        }
        loadMore={loadUserContent}
        fullyLoaded={fullyLoaded}
        data={userContent}
        renderItem={({ item: content }) => {
          if (content.type === "post") {
            return (
              <PostComponent
                post={content}
                setPost={(newPost) => modifyUserContent([newPost])}
              />
            );
          }
          if (content.type === "comment") {
            return (
              <CommentComponent
                comment={content}
                index={0}
                displayInList
                changeComment={(newComment) => modifyUserContent([newComment])}
                deleteComment={(comment) => deleteUserContent([comment])}
              />
            );
          }
          return null;
        }}
      />
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
});
