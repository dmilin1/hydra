import "react-native-url-polyfill/auto";
import { decode } from "html-entities";

import { api } from "./RedditApi";
import Redgifs from "../utils/RedGifs";
import RedditURL from "../utils/RedditURL";
import Time from "../utils/Time";
import URL, { OpenGraphData } from "../utils/URL";

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
  title: string;
  author: string;
  upvotes: number;
  scoreHidden: boolean;
  saved: boolean;
  userVote: VoteOption;
  subreddit: string;
  subredditIcon: string;
  isModerator: boolean;
  isStickied: boolean;
  isNSFW: boolean;
  isSpoiler: boolean;
  text: string;
  html: string;
  commentCount: number;
  link: string;
  images: string[];
  imageThumbnail: string;
  imageAspectRatio: number;
  video: string | undefined;
  redditAudioSource?: string;
  poll: Poll | undefined;
  externalLink: string | undefined;
  openGraphData: OpenGraphData | undefined;
  createdAt: number;
  timeSince: string;
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
  search?: string;
};

export async function formatPostData(child: any): Promise<Post> {
  const galleryIndexes =
    child.data.gallery_data?.items?.reduce?.(
      (acc: string[], item: any, i: number) => ({
        ...acc,
        [item.media_id]: i,
      }),
      {},
    ) ?? {};

  const galleryThumbnails = Object.values(child.data.media_metadata ?? {})
    .sort((a: any, b: any) => galleryIndexes[a.id] - galleryIndexes[b.id])
    .map((data: any) => data.p?.[0]?.u)
    .filter((img) => img !== undefined)
    .map((img: string) => decode(img));

  let images = Object.values(child.data.media_metadata ?? {})
    .sort((a: any, b: any) => galleryIndexes[a.id] - galleryIndexes[b.id])
    .map((data: any) => data.s?.u)
    .filter((img) => img !== undefined)
    .map((img: string) => decode(img));

  if (images.length === 0 && child.data.post_hint === "image") {
    images = [child.data.url];
  }
  if (
    images.length === 0 &&
    child.data.is_reddit_media_domain &&
    child.data?.url?.match(/\.(png|jpe?g|gif)$/i)
  ) {
    // I think these are posts that are image + text. They don't appear in the gallery
    images = [child.data.url];
  }

  // default in case we can't get the aspect ratio
  let imageAspectRatio = 0.75;
  if (child.data.preview?.images[0]?.source) {
    const { width, height } = child.data.preview.images[0].source;
    imageAspectRatio = width / height;
  } else if (child.data.gallery_data?.items?.[0]?.media_id) {
    const firstMediaId = child.data.gallery_data.items[0].media_id;
    const { x, y } = child.data.media_metadata[firstMediaId].s;
    imageAspectRatio = x / y;
  }

  let video = child.data.media?.reddit_video?.fallback_url;
  let redditAudioSource;
  if (video) {
    redditAudioSource = video.replace(/DASH_\d+/, "DASH_AUDIO_128");
  }

  let openGraphData = undefined;
  let externalLink = undefined;
  try {
    new RedditURL(child.data.url);
  } catch (_) {
    externalLink = child.data.url;
    if (externalLink.includes("imgur.com") && externalLink.endsWith(".gifv")) {
      video = externalLink.replace(".gifv", ".mp4");
    } else if (externalLink.includes("gfycat.com")) {
      video = `https://web.archive.org/web/0if_/thumbs.${externalLink.split("https://")[1]}-mobile.mp4`;
    } else if (externalLink.includes("redgifs.com")) {
      video = await Redgifs.getMediaURL(externalLink);
    } else if (externalLink) {
      try {
        openGraphData = await new URL(externalLink).getOpenGraphData();
      } catch (_) {
        // Might not have open graph data
      }
    }
  }

  let imageThumbnail = decode(child.data.thumbnail);

  const videoThumbnail =
    child.data.preview?.images[0]?.resolutions?.slice(-1)?.[0]?.url;
  if (video && videoThumbnail) {
    imageThumbnail = decode(videoThumbnail);
  }
  if (
    imageThumbnail === "spoiler" ||
    imageThumbnail === "nsfw" ||
    (images.length > 0 && !imageThumbnail)
  ) {
    // if the thumbnail is a spoiler, reddit doesn't give it to us...
    // and sometimes they don't give us a thumbnail anyway for reasons I can't figure out
    let imgPreviewThumbnail: string | null = decode(
      child.data.preview?.images[0]?.resolutions?.[0]?.url,
    );
    if (!imgPreviewThumbnail) {
      imgPreviewThumbnail = null;
    }
    // try to get the first image in the gallery, else the smallest preview image, else the first image
    imageThumbnail = galleryThumbnails[0] ?? imgPreviewThumbnail ?? images[0];
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

  return {
    id: child.data.id,
    name: child.data.name,
    type: "post",
    title: decode(child.data.title),
    author: child.data.author,
    upvotes: child.data.ups,
    scoreHidden: child.data.score_hidden,
    saved: child.data.saved,
    userVote,
    subreddit: child.data.subreddit,
    subredditIcon:
      child.data.sr_detail?.community_icon?.split("?")?.[0] ??
      child.data.sr_detail?.icon_img,
    isModerator: child.data.distinguished === "moderator",
    isStickied: child.data.stickied,
    isNSFW: child.data.over_18,
    isSpoiler: child.data.spoiler,
    text: decode(child.data.selftext),
    html: decode(child.data.selftext_html),
    commentCount: child.data.num_comments,
    link: `https://www.reddit.com${child.data.permalink}`,
    images,
    imageThumbnail,
    imageAspectRatio,
    video,
    redditAudioSource,
    poll,
    externalLink,
    openGraphData,
    createdAt: child.data.created,
    timeSince: new Time(child.data.created * 1000).prettyTimeSince() + " ago",
    after: child.data.name,
  };
}

export async function getPosts(
  url: string,
  options: GetPostOptions = {},
): Promise<Post[]> {
  let redditURL = new RedditURL(url);
  const subreddit = redditURL.getSubreddit();
  if (options.search && subreddit) {
    redditURL = new RedditURL(`https://www.reddit.com/r/${subreddit}/search/`);
    redditURL.changeQueryParam("q", options.search);
    redditURL.changeQueryParam("restrict_sr", "true");
  }
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
