import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { User, UserContent } from "../api/User";
import { getUser, getUserContent, parseUserURL } from "../api/gql/User";
import { StackPageProps } from "../app/stack";
import SortAndContext, {
  ContextTypes,
  SortTypes,
} from "../components/Navbar/SortAndContext";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import { CommentComponent } from "../components/RedditDataRepresentations/Post/PostParts/Comments";
import UserDetailsComponent, {
  UserContentType,
} from "../components/RedditDataRepresentations/User/UserDetailsComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import { AccountContext } from "../contexts/AccountContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../utils/RedditURL";
import { useURLNavigation } from "../utils/navigation";
import useRedditDataState from "../utils/useRedditDataState";
import AccessFailureComponent from "../components/UI/AccessFailureComponent";
import { SubredditContext } from "../contexts/SubredditContext";

export default function UserPage({ route }: StackPageProps<"UserPage">) {
  const url = route.params.url;
  const [sort, sortTime] = new RedditURL(url).getSort();

  const navigation = useURLNavigation();

  const { userName, section, savedType } = parseUserURL(url);

  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { subreddits, isSubscribed } = useContext(SubredditContext);

  const [user, setUser] = useState<User>();
  // What the base user page shows. Reddit has no mixed posts and comments feed.
  const [contentType, setContentType] = useState<UserContentType>("posts");

  const {
    data: userContent,
    loadMoreData: loadMoreUserContent,
    refreshData: refreshUserContent,
    modifyData: modifyUserContent,
    deleteData: deleteUserContent,
    fullyLoaded,
    hitFilterLimit,
    accessFailure,
  } = useRedditDataState<UserContent>({
    loadData: async (after) =>
      await getUserContent(url, { after, type: contentType }),
    refreshDependencies: [sort, sortTime, contentType],
  });

  const isDeepPath = !!section;

  const supportsGalleryMode =
    /**
     * Base user pages can be switched to comments, so gallery mode opens the
     * /submitted page instead, which always shows posts. This happens in
     * navigation.ts's openGallery function.
     */
    !section ||
    section === "submitted" ||
    section === "upvoted" ||
    section === "downvoted" ||
    savedType === "links";

  // The content list loads the same profile and shows why it failed.
  const loadUser = () =>
    getUser(url)
      .then(setUser)
      .catch(() => setUser(undefined));

  useEffect(() => {
    loadUser();
  }, [currentUser?.userName]);

  useEffect(() => {
    const contextOptions: ContextTypes[] = ["Share"];
    if (currentUser?.userName !== user?.userName) {
      contextOptions.unshift("Block");
      const isFollowing = isSubscribed(`u_${user?.userName}`);
      contextOptions.unshift(isFollowing ? "Unfollow" : "Follow", "Message");
    }
    if (supportsGalleryMode) {
      contextOptions.unshift("Open in Gallery Mode");
    }
    const sortOptions: SortTypes[] | undefined =
      !section || section === "submitted" || section === "comments"
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
  }, [sort, sortTime, user, supportsGalleryMode, subreddits.subscriber.length]);

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
        contentName={userName || "User"}
      >
        <RedditDataScroller<UserContent>
          ListHeaderComponent={() =>
            !isDeepPath &&
            user && (
              <UserDetailsComponent
                user={user}
                contentType={contentType}
                setContentType={setContentType}
              />
            )
          }
          loadMore={loadMoreUserContent}
          refresh={() => {
            if (!user) loadUser();
            return refreshUserContent();
          }}
          fullyLoaded={fullyLoaded}
          hitFilterLimit={hitFilterLimit}
          data={userContent}
          noDataFoundMessage={`${user?.userName ?? "This user"} has no activity or has set their account to private.`}
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
});
