import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import { StackActions, useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { Post } from "../../../../api/Posts";
import { PostDetail } from "../../../../api/PostDetail";
import { PostSettingsContext } from "../../../../contexts/SettingsContexts/PostSettingsContext";
import { PageTypeToNavName } from "../../../../utils/PageTypeToNavName";
import RedditURL from "../../../../utils/RedditURL";
import { OVERLAY_BACKGROUND_COLOR, OverlayIsland } from "./OverlayContext";

export default function PostInfoHeader({
  post,
  closeViewer,
}: {
  post: Post | PostDetail;
  closeViewer: () => void;
}) {
  const { dispatch } = useNavigation();
  const { showMediaPostInfo } = useContext(PostSettingsContext);

  const openLink = (link: string) => {
    const pageType = RedditURL.getPageType(link);
    /**
     * We have to use dispatch because this can be called from outside the tabs navigator.
     */
    dispatch(
      StackActions.push(PageTypeToNavName[pageType], {
        url: link,
      }),
    );
    closeViewer();
  };

  return (
    <View style={styles.topRow} pointerEvents="box-none">
      <View style={styles.chipSlot} pointerEvents="box-none">
        {showMediaPostInfo ? (
          <OverlayIsland style={styles.chipIsland}>
            <Touchable
              style={styles.postChip}
              onPress={() => openLink(post.link)}
            >
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {post.title}
              </Text>
              <View style={styles.metadataContainer}>
                <Touchable
                  activeOpacity={0.2}
                  animationDuration={{ in: 0, out: 150 }}
                  onPress={() => openLink(`/r/${post.subreddit}`)}
                >
                  <Text style={styles.metadataText}>/r/{post.subreddit}</Text>
                </Touchable>
                <Text style={styles.metadataText}> by </Text>
                <Touchable
                  activeOpacity={0.2}
                  animationDuration={{ in: 0, out: 150 }}
                  onPress={() => openLink(`/user/${post.author}`)}
                >
                  <Text style={styles.metadataText}>{post.author}</Text>
                </Touchable>
              </View>
            </Touchable>
          </OverlayIsland>
        ) : null}
      </View>
      <OverlayIsland>
        <Touchable
          activeOpacity={0.2}
          animationDuration={{ in: 0, out: 150 }}
          onPress={() => closeViewer()}
          style={styles.closeButton}
        >
          <FontAwesome6
            iconStyle="solid"
            name="xmark"
            size={20}
            color="white"
          />
        </Touchable>
      </OverlayIsland>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  chipSlot: {
    flex: 1,
  },
  chipIsland: {
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  postChip: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: OVERLAY_BACKGROUND_COLOR,
    gap: 3,
  },
  closeButton: {
    backgroundColor: OVERLAY_BACKGROUND_COLOR,
    padding: 10,
    borderRadius: 100,
    width: 40,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 15,
    fontWeight: 500,
  },
  metadataContainer: {
    flexDirection: "row",
  },
  metadataText: {
    color: "white",
    fontSize: 12,
    opacity: 0.85,
  },
});
