import AntDesign from "@react-native-vector-icons/ant-design";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { shareAsync } from "expo-sharing";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Touchable } from "react-native-gesture-handler";
import ViewShot, { ViewShotRef } from "react-native-view-shot";

import ShareablePostDetails from "./ShareablePostDetails";
import { Comment, PostDetail } from "../../../api/PostDetail";
import { ModalContext } from "../../../contexts/ModalContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { getCommentFromPath } from "../../../utils/commentTree";
import CommentComponent from "../../RedditDataRepresentations/Post/PostParts/Comments/CommentComponent";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import { StackActions, TabActions } from "@react-navigation/native";
import { useURLNavigation } from "../../../utils/navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PREVIEW_FALLBACK_HEIGHT = 100;

type ShareAsImageProps = {
  comment?: Comment;
  postDetail: PostDetail;
};

export default function ShareAsImage({
  comment,
  postDetail,
}: ShareAsImageProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);
  const { isPro } = useContext(SubscriptionsContext);

  const { width: windowWidth } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();

  const { dispatch } = useURLNavigation();

  const viewShot = useRef<ViewShotRef>(null);

  const maxParents = comment?.depth ?? 0;
  const [parentCount, setParentCount] = useState(0);
  const [includePostDetails, setIncludePostDetails] = useState(!comment);
  const [flattenCommentTree, setFlattenCommentTree] = useState(false);
  const [hideUsernames, setHideUsernames] = useState(false);
  const [hideSubreddit, setHideSubreddit] = useState(false);
  const [showHydraWatermark, setShowHydraWatermark] = useState(!isPro);
  const [imageURI, setImageURI] = useState<string>();
  const [captureHeight, setCaptureHeight] = useState<number>();

  const shareTree = useMemo(() => {
    if (!comment) return null;
    const chain: Comment[] = [];
    for (
      let depth = comment.depth - parentCount;
      depth <= comment.depth;
      depth++
    ) {
      const node = getCommentFromPath(
        postDetail,
        comment.path.slice(0, depth + 1),
      );
      if (node?.type === "comment") {
        chain.push(node);
      }
    }
    return chain.reduceRight<Comment | null>(
      (child, node, index) => ({
        ...node,
        depth: flattenCommentTree ? index : (node?.depth ?? 0),
        collapsed: false,
        comments: child ? [child] : [],
        loadMore: undefined,
      }),
      null,
    );
  }, [comment, postDetail, parentCount, flattenCommentTree]);

  // Delayed so remote media in the off screen render has a beat to load
  // before the capture. Almost always cache hits from the visible page.
  useEffect(() => {
    setImageURI(undefined);
    const capture = setTimeout(async () => {
      try {
        const uri = await viewShot.current?.capture();
        if (uri) {
          setImageURI(uri);
        }
      } catch (_) {
        Alert.alert("Error", "Failed to generate image");
        setModal(null);
      }
    }, 250);
    return () => clearTimeout(capture);
  }, [
    parentCount,
    includePostDetails,
    flattenCommentTree,
    showHydraWatermark,
    hideUsernames,
    hideSubreddit,
  ]);

  const shareImage = async () => {
    if (!imageURI) return;
    if (Platform.OS === "ios") {
      await Share.share({ url: imageURI });
    } else {
      await shareAsync(imageURI, { mimeType: "image/png" });
    }
  };

  return (
    <>
      <View style={styles.captureContainer} pointerEvents="none">
        <ViewShot
          ref={viewShot}
          onLayout={(e) => setCaptureHeight(e.nativeEvent.layout.height)}
          style={{
            width: windowWidth,
            backgroundColor: theme.background,
          }}
        >
          {includePostDetails && (
            <ShareablePostDetails
              postDetail={postDetail}
              hideUsernames={hideUsernames}
              hideSubreddit={hideSubreddit}
            />
          )}
          {shareTree && (
            <CommentComponent
              comment={shareTree}
              postDetail={postDetail}
              displayForImageShareSettings={{
                depth: 0,
                hideUsernames,
              }}
              changeComment={() => {}}
              deleteComment={() => {}}
            />
          )}
          {showHydraWatermark && (
            <View style={styles.watermarkContainer}>
              <Text style={{ color: theme.text }}>via Hydra</Text>
              <Image
                source={require("../../../assets/images/icon.png")}
                style={styles.hydraLogo}
              />
            </View>
          )}
        </ViewShot>
      </View>
      <View style={styles.modalContainer}>
        <Touchable
          style={styles.background}
          defaultOpacity={0.7}
          onTouchStart={() => setModal(null)}
        />
        <View
          style={[
            styles.panel,
            {
              backgroundColor: theme.tint,
              paddingBottom: bottom,
            },
          ]}
        >
          <View
            style={[
              styles.preview,
              captureHeight
                ? { aspectRatio: windowWidth / captureHeight }
                : { height: PREVIEW_FALLBACK_HEIGHT },
            ]}
          >
            {imageURI ? (
              <Image
                source={{ uri: imageURI }}
                style={styles.previewImage}
                contentFit="contain"
              />
            ) : (
              <ActivityIndicator size="small" />
            )}
          </View>
          {!!comment && (
            <>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Parent Comments
                </Text>
                <View style={styles.stepper}>
                  <Touchable
                    activeOpacity={0.5}
                    animationDuration={{ in: 0, out: 150 }}
                    disabled={parentCount === 0}
                    onPress={() => {
                      setParentCount(parentCount - 1);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <AntDesign
                      name="minus-circle"
                      size={24}
                      color={
                        parentCount > 0
                          ? theme.iconPrimary
                          : theme.iconSecondary
                      }
                      style={{
                        opacity: parentCount > 0 ? 1 : 0.3,
                      }}
                    />
                  </Touchable>
                  <Text style={[styles.stepperCount, { color: theme.text }]}>
                    {parentCount}
                  </Text>
                  <Touchable
                    activeOpacity={0.5}
                    animationDuration={{ in: 0, out: 150 }}
                    disabled={parentCount === maxParents}
                    onPress={() => {
                      setParentCount(parentCount + 1);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <AntDesign
                      name="plus-circle"
                      size={24}
                      color={
                        parentCount < maxParents
                          ? theme.iconPrimary
                          : theme.iconSecondary
                      }
                      style={{
                        opacity: parentCount < maxParents ? 1 : 0.3,
                      }}
                    />
                  </Touchable>
                </View>
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Include Post Details
                </Text>
                <Switch
                  trackColor={{
                    false: theme.iconSecondary,
                    true: theme.iconPrimary,
                  }}
                  value={includePostDetails}
                  onValueChange={() =>
                    setIncludePostDetails(!includePostDetails)
                  }
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Flatten Comment Tree
                </Text>
                <Switch
                  trackColor={{
                    false: theme.iconSecondary,
                    true: theme.iconPrimary,
                  }}
                  value={parentCount !== maxParents && flattenCommentTree}
                  onValueChange={() =>
                    setFlattenCommentTree(!flattenCommentTree)
                  }
                  disabled={parentCount === maxParents}
                />
              </View>
            </>
          )}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Hide Subreddit
            </Text>
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={includePostDetails && hideSubreddit}
              disabled={!includePostDetails}
              onValueChange={() => setHideSubreddit(!hideSubreddit)}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Hide Usernames
            </Text>
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={hideUsernames}
              onValueChange={() => setHideUsernames(!hideUsernames)}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Watermark
            </Text>
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={showHydraWatermark}
              onValueChange={() => {
                if (!isPro) {
                  Alert.alert(
                    "Hydra Pro Feature",
                    "Disabling the watermark is a Hydra Pro feature",
                    [
                      {
                        text: "Get Hydra Pro",
                        isPreferred: true,
                        onPress: () => {
                          setModal(null);
                          dispatch(TabActions.jumpTo("Settings"));
                          dispatch(
                            StackActions.push("SettingsPage", {
                              url: "hydra://settings/hydraPro",
                            }),
                          );
                        },
                      },
                      {
                        text: "Maybe Later",
                        style: "cancel",
                      },
                    ],
                  );
                  return;
                }
                setShowHydraWatermark(!showHydraWatermark);
              }}
            />
          </View>
          <Touchable
            style={[
              styles.shareButton,
              {
                backgroundColor: theme.buttonBg,
              },
            ]}
            activeOpacity={0.8}
            animationDuration={{ in: 0, out: 150 }}
            onPress={() => shareImage()}
            disabled={!imageURI}
          >
            <Text style={[styles.shareButtonText, { color: theme.buttonText }]}>
              Share
            </Text>
          </Touchable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  captureContainer: {
    position: "absolute",
    top: 0,
    left: -10_000,
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  panel: {
    width: "100%",
    maxHeight: "85%",
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  preview: {
    flexShrink: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    marginHorizontal: "auto",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  stepperCount: {
    fontSize: 16,
    minWidth: 20,
    textAlign: "center",
  },
  shareButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: 18,
  },
  watermarkContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: -5,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  hydraLogo: {
    width: 20,
    height: 20,
  },
});
