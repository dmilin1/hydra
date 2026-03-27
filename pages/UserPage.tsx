import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  BannedUserError,
  User,
  UserContent,
  UserDoesNotExistError,
  getUser,
  getUserContent,
} from "../api/User";
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
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../utils/RedditURL";
import URL from "../utils/URL";
import { useURLNavigation } from "../utils/navigation";
import useRedditDataState from "../utils/useRedditDataState";
import AccessFailureComponent from "../components/UI/AccessFailureComponent";

export default function UserPage({ route }: StackPageProps<"UserPage">) {
  const url = route.params.url;
  const [sort, sortTime] = new RedditURL(url).getSort();

  const navigation = useURLNavigation();

  const section = new RedditURL(url).getRelativePath().split("/")[3];

  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);

  const [user, setUser] = useState<User>();

  const {
    data: userContent,
    loadMoreData: loadMoreUserContent,
    refreshData: refreshUserContent,
    modifyData: modifyUserContent,
    deleteData: deleteUserContent,
    fullyLoaded,
    hitFilterLimit,
    accessFailure,
  } = useRedditDataState<UserContent, "userLoadingError">({
    loadData: async (after) => await getUserContent(url, { after }),
    refreshDependencies: [sort, sortTime],
  });

  const isDeepPath = !!new URL(url).getBasePath().split("/")[5]; // More than just /user/username like /user/username/comments

  const loadUser = async () => {
    const userUrl = new RedditURL(url)
      .getRelativePath()
      .split("/")
      .slice(0, 3)
      .join("/");
    try {
      const userData = await getUser(`https://www.reddit.com${userUrl}`);
      setUser(userData);
    } catch (e) {
      if (e instanceof BannedUserError || e instanceof UserDoesNotExistError) {
        // The useRedditDataState hook will also get this error and handle it for us
        return;
      }
      throw e;
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const contextOptions: ContextTypes[] = ["Block", "Share"];
    if (currentUser?.userName !== user?.userName) {
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
            pageData={user}
          />
        );
      },
    });
  }, [sort, sortTime, user]);

  return (
    <View
      style={[
        styles.userContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <AccessFailureComponent
        accessFailure={accessFailure}
        contentName={
          new RedditURL(url).getRelativePath().split("/")[2] ?? "User"
        }
      >
        <RedditDataScroller<UserContent>
          ListHeaderComponent={() =>
            !isDeepPath && user && <UserDetailsComponent user={user} />
          }
          loadMore={loadMoreUserContent}
          refresh={refreshUserContent}
          fullyLoaded={fullyLoaded}
          hitFilterLimit={hitFilterLimit}
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
                  changeComment={(newComment) =>
                    modifyUserContent([newComment])
                  }
                  deleteComment={(comment) => deleteUserContent([comment])}
                />
              );
            }
            return null;
          }}
        />
      </AccessFailureComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    marginTop: 20,
  },
});
