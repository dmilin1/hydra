import "react-native-url-polyfill/auto";
import { decode } from "html-entities";

import { api } from "./RedditApi";
import Redgifs from "../utils/RedGifs";
import RedditURL from "../utils/RedditURL";
import Time from "../utils/Time";

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
  text: string;
  html: string;
  commentCount: number;
  link: string;
  images: string[];
  imageThumbnail: string;
  video: string | undefined;
  redditAudioSource?: string;
  poll: Poll | undefined;
  externalLink: string | undefined;
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
  let images = Object.values(child.data.media_metadata ?? {})
    .map((data: any) => data.s?.u?.replace(/&amp;/g, "&"))
    .filter((img) => img !== undefined);
  if (images.length === 0 && child.data.post_hint === "image") {
    images = [child.data.url];
  }

  let video = child.data.media?.reddit_video?.fallback_url;
  let redditAudioSource;
  if (video) {
    redditAudioSource = video.replace(/DASH_\d+/, "DASH_AUDIO_128");
  }

  let externalLink = undefined;
  try {
    new RedditURL(child.data.url);
  } catch (_) {
    externalLink = child.data.url;
    if (externalLink.includes("imgur.com") && externalLink.endsWith(".gifv")) {
      video = externalLink.replace(".gifv", ".mp4");
    }
    if (externalLink.includes("gfycat.com")) {
      video = `https://web.archive.org/web/0if_/thumbs.${externalLink.split("https://")[1]}-mobile.mp4`;
    }
    if (externalLink.includes("redgifs.com")) {
      video = await Redgifs.getMediaURL(externalLink);
    }
  }

  let imageThumbnail = decode(child.data.thumbnail);

  const videoThumbnail =
    child.data.preview?.images[0]?.resolutions?.slice(-1)?.[0]?.url;
  if (video && videoThumbnail) {
    imageThumbnail = decode(videoThumbnail);
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
    text: decode(child.data.selftext),
    html: decode(child.data.selftext_html),
    commentCount: child.data.num_comments,
    link: `https://www.reddit.com${child.data.permalink}`,
    images,
    imageThumbnail,
    video,
    redditAudioSource,
    poll,
    externalLink,
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
