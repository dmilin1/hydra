import { useEffect } from "react";
import { Post } from "../api/Posts";
import RedditURL from "./RedditURL";
import KeyStore from "./KeyStore";
import { Alert } from "react-native";
import { useURLNavigation } from "./navigation";

type OfferGalleryModeProps = {
  url: string;
  posts: Post[];
};

const MIN_POST_COUNT_TO_OFFER_GALLERY_MODE = 100;
const PERCENT_OF_MEDIA_TO_OFFER_GALLERY_MODE = 0.85;

const HAS_ALREADY_OFFERED_KEY = "has_already_offered_gallery_mode";

export default function useOfferGalleryMode({
  url,
  posts,
}: OfferGalleryModeProps) {
  const { openGallery } = useURLNavigation();

  useEffect(() => {
    if (KeyStore.getBoolean(HAS_ALREADY_OFFERED_KEY)) return;

    if (posts.length < MIN_POST_COUNT_TO_OFFER_GALLERY_MODE) return;

    const redditURL = new RedditURL(url);
    const isCombinedSubredditFeed = redditURL.isCombinedSubredditFeed();
    if (isCombinedSubredditFeed) return;

    const numberOfMediaItems = posts.filter(
      (post) => post.images.length > 0 || post.video !== undefined,
    ).length;
    if (
      numberOfMediaItems <
      posts.length * PERCENT_OF_MEDIA_TO_OFFER_GALLERY_MODE
    )
      return;

    Alert.alert(
      "Try Gallery Mode?",
      "Media heavy subreddits look great in gallery mode. Would you like to try it out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open",
          onPress: () => {
            KeyStore.set(HAS_ALREADY_OFFERED_KEY, true);
            openGallery(url);
            Alert.alert(
              "Gallery Mode",
              "You can open gallery mode any time with the ... menu button in the top right corner of subreddit pages.",
            );
          },
        },
      ],
    );
  }, [posts.length >= MIN_POST_COUNT_TO_OFFER_GALLERY_MODE]);
}
