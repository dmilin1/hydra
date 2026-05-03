import "react-native-url-polyfill/auto";
import { decode } from "html-entities";

import { Flair, formatFlair } from "./Flair";
import { api } from "./RedditApi";
import Redgifs from "../utils/RedGifs";
import RedditURL from "../utils/RedditURL";
import Time from "../utils/Time";
import URL, { OpenGraphData } from "../utils/URL";
import { Alert } from "react-native";
import { formatPostFlair, PostFlair } from "./PostFlair";
import { ImageSource } from "expo-image";

export type Poll = {
  voteCount: number;
  options: {
    id: string;
    text: string;
  }[];
};

export type Post = {
  id: string;
  name: string;
  type: "post";
  crossPost?: Post;
  crossCommentLink?: string;
  title: string;
  author: string;
  upvotes: number;
  scoreHidden: boolean;
  saved: boolean;
  userVote: VoteOption;
  flair: Flair | null;
  postFlair: PostFlair | null;
  subreddit: string;
  subredditIcon: string;
  isModerator: boolean;
  isStickied: boolean;
  isNSFW: boolean;
  isSpoiler: boolean;
  interactionDisabledStatus: "locked" | "archived" | null;
  text: string;
  html: string;
  commentCount: number;
  link: string;
  images: (string | ImageSource[])[];
  imageThumbnail: ImageSource | null;
  mediaAspectRatio: number;
  videos: { source: string; videoDownloadURL: string }[];
  poll: Poll | undefined;
  externalLink: string | undefined;
  openGraphData: OpenGraphData | undefined;
  createdAt: number;
  timeSince: string;
  shortTimeSince: string;
  after: string;
};

export enum VoteOption {
  UpVote = 1,
  NoVote = 0,
  DownVote = -1,
}

type GetPostOptions = {
  limit?: number;
  after?: string;
};

function formatImages(child: any): ImageSource[][] {
  /**
   * Images can be stored in .preview or in .media_metadata. I'm not sure what causes
   * one or the other. We try loading both.
   */
  if (child.data.preview?.images?.length) {
    return child.data.preview.images.map((image: any) => {
      const sizes = image.resolutions.map(
        (item: any) =>
          ({
            uri: decode(item.url),
            width: item.width,
            height: item.height,
          }) as ImageSource,
      );
      if (image.source) {
        sizes.push({
          uri: decode(image.source.url),
          width: image.source.width,
          height: image.source.height,
        } as ImageSource);
      }
      return sizes;
    });
  }
  if (child.data.gallery_data?.items?.length) {
    const galleryIndexes =
      child.data.gallery_data?.items?.reduce?.(
        (acc: string[], item: any, i: number) => ({
          ...acc,
          [item.media_id]: i,
        }),
        {},
      ) ?? {};

    return Object.values(child.data.media_metadata ?? {})
      .sort((a: any, b: any) => galleryIndexes[a.id] - galleryIndexes[b.id])
      .map((data: any) => {
        const sizes = data.p.map(
          (item: any) =>
            ({
              uri: decode(item.u),
              width: item.x,
              height: item.y,
            }) as ImageSource,
        );
        if (data.s) {
          sizes.push({
            uri: decode(data.s.u),
            width: data.s.x,
            height: data.s.y,
          } as ImageSource);
        }
        return sizes;
      });
  }
  return [];
}

async function formatVideos(
  child: any,
): Promise<{ source: string; videoDownloadURL: string }[]> {
  if (child.data.media?.reddit_video?.hls_url) {
    return [
      {
        source: child.data.media.reddit_video.hls_url,
        videoDownloadURL: child.data.media.reddit_video.fallback_url,
      },
    ];
  }
  if (child.data.preview?.images?.[0]?.variants?.mp4) {
    // Example post: https://www.reddit.com/r/gifs/comments/1rzl4fp/seth_hernandez_throws_a_1024_mph_laser_on_the/
    return child.data.preview.images.map((image: any) => {
      const item = image.variants.mp4.resolutions.at(-1);
      return {
        source: decode(item.url),
        videoDownloadURL: decode(item.url),
      };
    });
  }
  if (child.data.gallery_data?.items?.length) {
    // Example post: https://www.reddit.com/r/CelebsWithPetiteTits/comments/1s4xx9l/ana_de_armas_or_alison_brie/
    const galleryIndexes =
      child.data.gallery_data?.items?.reduce?.(
        (acc: string[], item: any, i: number) => ({
          ...acc,
          [item.media_id]: i,
        }),
        {},
      ) ?? {};

    return Object.values(child.data.media_metadata ?? {})
      .sort((a: any, b: any) => galleryIndexes[a.id] - galleryIndexes[b.id])
      .map((data: any) => {
        if (!data.s.mp4) return null;
        const url = decode(data.s.mp4);
        return {
          source: url,
          videoDownloadURL: url,
        };
      })
      .filter((video) => video !== null);
  }
  const { url, isValid } = RedditURL.getURLIfValid(child.data.url);
  if (!isValid) {
    if (url.includes("imgur.com") && url.endsWith(".gifv")) {
      const videoURL = url.replace(".gifv", ".mp4");
      return [
        {
          source: videoURL,
          videoDownloadURL: videoURL,
        },
      ];
    } else if (url.includes("gfycat.com")) {
      const videoURL = `https://web.archive.org/web/0if_/thumbs.${url.split("https://")[1]}-mobile.mp4`;
      return [
        {
          source: videoURL,
          videoDownloadURL: videoURL,
        },
      ];
    } else if (url.includes("redgifs.com")) {
      const videoURL = await Redgifs.getMediaURL(url);
      return [
        {
          source: videoURL,
          videoDownloadURL: videoURL,
        },
      ];
    }
  }
  return [];
}

export async function formatPostData(child: any): Promise<Post> {
  const images = formatImages(child);
  const imageThumbnail = images?.at(0)?.at(0) ?? null;

  // default in case we can't get the aspect ratio
  let mediaAspectRatio = 0.75;
  if (images.length && images[0][0].width && images[0][0].height) {
    mediaAspectRatio = images[0][0].width / images[0][0].height;
  }

  const videos = await formatVideos(child);

  let openGraphData: OpenGraphData | undefined = undefined;
  let externalLink = undefined;
  let crossCommentLink = undefined;

  const { url, isValid } = RedditURL.getURLIfValid(child.data.url);
  if (isValid) {
    if (
      child.data.url.includes("/comments/") &&
      !child.data.url.includes(child.data.permalink)
    ) {
      crossCommentLink = url;
    } else if (
      url.includes("/r/") &&
      !url.includes(`/r/${child.data.subreddit}`)
    ) {
      // Link posts that point to other posts or subreddits but are not cross posts
      externalLink = url;
    }
  } else {
    externalLink = child.data.url;
    if (
      !videos.length &&
      !url.includes("imgur.com") &&
      !url.includes("gfycat.com") &&
      !url.includes("redgifs.com") &&
      !url.includes(".gif") &&
      !url.includes(".gifv") &&
      !url.includes(".mp4")
    ) {
      openGraphData = await new URL(externalLink).getOpenGraphData();
    }
  }

  let poll = undefined;
  if (child.data.poll_data) {
    poll = {
      voteCount: child.data.poll_data.total_vote_count,
      options: child.data.poll_data.options,
    };
  }

  let userVote = VoteOption.NoVote;
  if (child.data.likes === true) {
    userVote = VoteOption.UpVote;
  } else if (child.data.likes === false) {
    userVote = VoteOption.DownVote;
  }

  let crossPost: Post | undefined = undefined;
  if (child.data.crosspost_parent_list?.[0]) {
    crossPost = await formatPostData({
      data: child.data.crosspost_parent_list[0],
    });
  }

  return {
    id: child.data.id,
    name: child.data.name,
    type: "post",
    crossPost,
    crossCommentLink,
    title: decode(child.data.title),
    author: child.data.author,
    upvotes: child.data.ups,
    scoreHidden: child.data.score_hidden,
    saved: child.data.saved,
    userVote,
    flair: formatFlair(child.data),
    postFlair: formatPostFlair(child.data),
    subreddit: child.data.subreddit,
    subredditIcon:
      child.data.sr_detail?.community_icon?.split("?")?.[0] ??
      child.data.sr_detail?.icon_img,
    isModerator: child.data.distinguished === "moderator",
    isStickied: child.data.stickied,
    isNSFW: child.data.over_18,
    isSpoiler: child.data.spoiler,
    interactionDisabledStatus: child.data.archived
      ? "archived"
      : child.data.locked
        ? "locked"
        : null,
    text: decode(child.data.selftext),
    html: decode(child.data.selftext_html),
    commentCount: child.data.num_comments,
    link: `https://www.reddit.com${child.data.permalink}`,
    images,
    imageThumbnail,
    mediaAspectRatio,
    videos,
    poll,
    externalLink,
    openGraphData,
    createdAt: child.data.created,
    timeSince: new Time(child.data.created * 1000).prettyTimeSince() + " ago",
    shortTimeSince: new Time(child.data.created * 1000).shortPrettyTimeSince(),
    after: child.data.name,
  };
}

export class BannedSubredditError extends Error {
  name: "BannedSubredditError";
  constructor() {
    super("BannedSubredditError");
    this.name = "BannedSubredditError";
  }
}

export class PrivateSubredditError extends Error {
  name: "PrivateSubredditError";
  constructor() {
    super("PrivateSubredditError");
    this.name = "PrivateSubredditError";
  }
}

export async function getPosts(
  url: string,
  options: GetPostOptions = {},
): Promise<Post[]> {
  const redditURL = new RedditURL(url);
  redditURL.changeQueryParam("sr_detail", "true");
  redditURL.changeQueryParam("limit", String(options?.limit ?? 10));
  redditURL.changeQueryParam("after", options?.after ?? "");
  redditURL.jsonify();
  let response = await api(redditURL.toString());
  const gatedResult = await handleGatedSubreddit(response, url);
  if (gatedResult === "cancelled") return [];
  if (gatedResult === "success") {
    response = await api(redditURL.toString());
  }
  if (response.reason === "banned") {
    throw new BannedSubredditError();
  }
  if (response.reason === "private") {
    throw new PrivateSubredditError();
  }
  const posts: Post[] = await Promise.all(
    response.data.children.map(
      async (child: any) => await formatPostData(child),
    ),
  );
  return posts;
}

export async function handleGatedSubreddit(
  response: any,
  url: string,
): Promise<"success" | "cancelled" | null> {
  const warning =
    response.quarantine_message ?? response.interstitial_warning_message;
  if (!warning) return null;
  const type = response.quarantine_message ? "quarantine" : "gated";
  return new Promise((resolve) => {
    Alert.alert("Warning", warning, [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          resolve("cancelled");
        },
      },
      {
        text: "Proceed",
        onPress: async () => {
          await api(
            `https://old.reddit.com/${type}`,
            {
              method: "POST",
            },
            {
              requireAuth: true,
              body: {
                sr_name: new RedditURL(url).getSubreddit(),
                accept: "yes",
              },
              dontJsonifyResponse: true,
            },
          );
          resolve("success");
        },
      },
    ]);
  });
}

export async function searchSubredditPosts(
  url: string,
  options: GetPostOptions = {},
): Promise<Post[]> {
  const redditURL = new RedditURL(url);
  redditURL.changeQueryParam("restrict_sr", "true");
  redditURL.changeQueryParam("sr_detail", "true");
  redditURL.changeQueryParam("limit", String(options?.limit ?? 10));
  redditURL.changeQueryParam("after", options?.after ?? "");
  redditURL.jsonify();
  const response = await api(redditURL.toString());
  const posts: Post[] = await Promise.all(
    response.data.children.map(
      async (child: any) => await formatPostData(child),
    ),
  );
  return posts;
}
