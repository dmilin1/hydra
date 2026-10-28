import { ImageSource } from "expo-image";

import { defineOperation, gql, GqlOperation } from "./GqlApi";
import { checkSubredditAccess } from "./SubredditAccess";
import { contentToHtml } from "./RichText";
import { Flair } from "../Flair";
import { Poll, Post, VoteOption } from "../Posts";
import { PostFlair } from "../PostFlair";
import Redgifs from "../../utils/RedGifs";
import RedditURL, { PageType } from "../../utils/RedditURL";
import Time from "../../utils/Time";
import URL, { OpenGraphData } from "../../utils/URL";

/**
 * Post feeds load like they do in Reddit's app: a feed query returns the
 * page's post ids (as server-driven UI cells we otherwise ignore), then
 * PostsByIds fetches the full posts. Every feed shares that second step, so
 * all of them produce the same Post shape.
 */

const HomeFeedSdui = defineOperation(
  "HomeFeedSdui",
  "03d0ec0f2674005fe6c9777f952bd063ea2236527794344d4579fec8a669bea0",
);

const PopularFeedSdui = defineOperation(
  "PopularFeedSdui",
  "effee8db2d66287bea4e08a3ccf3a5fcb2db245c363be6fe50a3ba01e9962a24",
);

const AllFeedSdui = defineOperation(
  "AllFeedSdui",
  "dea8ebf08bd9127a580fd664b9c312e590a195690f5c04c32d60b9370d876fb0",
);

const SubredditFeedSdui = defineOperation(
  "SubredditFeedSdui",
  "45faffc9969af3d623a079e279c9d9a535b6f877809426a9a8ed203f046a23f0",
);

// Multireddits ("custom feeds" in Reddit's app).
const CustomFeedSdui = defineOperation(
  "CustomFeedSdui",
  "5a7d82da6ae429dcc26d7e7f0530c09dabc27f140db52c44312d6c9a5fac5a04",
);

const PostsByIds = defineOperation(
  "PostsByIds",
  "b210ea1d852cdc2c25d9bff2d9fa8a406e1a968f36392798812f336694ac27f4",
);

// The variables Reddit's app sends with PostsByIds.
const POSTS_BY_IDS_VARIABLES = {
  includeAwards: true,
  includeSubredditInPosts: true,
  includePcpV2InPosts: true,
  includePostStats: true,
  includeDeletedPosts: true,
  includeCurrentUserAwards: false,
  includeStillMediaAltText: true,
  includeExtraStillResolutions: true,
  includeExtendedVideoAsset: false,
  includePlaybackMp4s: true,
  includeMuxedMp4s: true,
  includeDevvitData: true,
  includeCommunityStatus: true,
  includeIsModRemovedContentReadAllowed: true,
  includeVideoPlaybackInComments: false,
  includeUnavailablePostReason: true,
  commentId: "",
  includeCommentId: false,
  includePredictedRemovalReasons: true,
  includeSubredditBackgroundColor: true,
  includeOverlayData: true,
  includeCtaEnrichedPageTitle: true,
  includePlaCards: true,
  includePlaCardThumbnail: false,
  includeWebviewPrefetchField: true,
  includeAdBrowserDestinationField: true,
  includeCollectionsHeroCard: true,
  includeGalleryAdUrl: true,
  includeCtaMediaColor: true,
  includeFollowedForNotificationsStatus: true,
  includeRedditHandleInfo: true,
  includeVerificationStatus: true,
  skipModerationInfo: false,
  includeIsReceivingPostReplies: false,
  includeIsActiveComments: true,
  includeMediaSynthesis: true,
  skipRedditPlayPlaybackMp4s: true,
  includeLinkPreviewTitle: false,
  includeInterestTags: false,
  includePostTombstone: true,
  includeAutomatedFeedback: false,
};

/**
 * PostsByIds' include flags for the other queries that return full posts
 * (postFragment: search, upvoted, downvoted and hidden posts), so their posts
 * format the same. Only the flags those queries declare: GraphQL rejects
 * unknown variables.
 */
export const POST_FRAGMENT_VARIABLES = Object.fromEntries(
  (
    [
      "includeSubredditInPosts",
      "includeAwards",
      "includePostStats",
      "includeCurrentUserAwards",
      "includeStillMediaAltText",
      "includeExtraStillResolutions",
      "includeExtendedVideoAsset",
      "includePlaybackMp4s",
      "includeMuxedMp4s",
      "includeDevvitData",
      "includeCommunityStatus",
      "includeIsModRemovedContentReadAllowed",
      "includeVideoPlaybackInComments",
      "includeSubredditBackgroundColor",
      "includeOverlayData",
      "includeCtaEnrichedPageTitle",
      "includePlaCards",
      "includePlaCardThumbnail",
      "includeWebviewPrefetchField",
      "includeAdBrowserDestinationField",
      "includeCollectionsHeroCard",
      "includeGalleryAdUrl",
      "includeCtaMediaColor",
      "includeFollowedForNotificationsStatus",
      "includePredictedRemovalReasons",
      "includeRedditHandleInfo",
      "includeVerificationStatus",
      "skipModerationInfo",
      "includeIsReceivingPostReplies",
      "includeIsActiveComments",
      "includeMediaSynthesis",
      "skipRedditPlayPlaybackMp4s",
      "includeLinkPreviewTitle",
    ] as const
  ).map((name) => [name, POSTS_BY_IDS_VARIABLES[name]]),
);

// Image size aliases, smallest first, full size last.
const STILL_SIZES = [
  "small",
  "medium",
  "large",
  "midlarge480",
  "xlarge",
  "xlargePlus720",
  "xxlarge",
  "xxxlarge",
  "source",
];
const ASSET_SIZES = [
  "small",
  "medium",
  "large",
  "xlarge",
  "xxlarge",
  "xxxlarge",
];

type GetPostOptions = {
  after?: string;
};

export function parseTime(iso: string): number {
  // "2026-10-04T00:26:11.575000+0000" -> "2026-10-04T00:26:11.575+00:00"
  const normalized = iso
    .replace(/(\.\d{3})\d+/, "$1")
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  return Date.parse(normalized) / 1000;
}

function toImageSources(sources: any[]): ImageSource[] {
  const seen = new Set<string>();
  return sources
    .filter((source) => source?.url && !seen.has(source.url))
    .map((source) => {
      seen.add(source.url);
      return {
        uri: source.url,
        width: source.dimensions?.width,
        height: source.dimensions?.height,
      };
    });
}

function formatImages(post: any): ImageSource[][] {
  if (post.gallery?.items?.length) {
    return post.gallery.items
      .map((item: any) => {
        const asset = item.media;
        if (!asset) return [];
        return toImageSources([
          ...ASSET_SIZES.map((size) => asset[size]),
          asset.url && {
            url: asset.url,
            dimensions: { width: asset.width, height: asset.height },
          },
        ]);
      })
      .filter((sizes: ImageSource[]) => sizes.length);
  }
  const still = post.media?.still;
  if (still) {
    const sizes = toImageSources(STILL_SIZES.map((size) => still[size]));
    return sizes.length ? [sizes] : [];
  }
  return [];
}

async function formatVideos(post: any): Promise<Post["videos"]> {
  const streaming = post.media?.streaming;
  if (streaming?.hlsUrl) {
    return [{ source: streaming.hlsUrl, hasAudio: !streaming.isGif }];
  }
  const animated = post.media?.animated;
  const mp4 = animated?.mp4_source ?? animated?.mp4_xxxlarge;
  if (mp4?.url) {
    return [{ source: mp4.url, hasAudio: false }];
  }
  // Videos hosted outside Reddit.
  const { url, isValid } = RedditURL.getURLIfValid(post.url ?? "");
  if (!isValid) {
    if (url.includes("imgur.com") && url.endsWith(".gifv")) {
      return [{ source: url.replace(".gifv", ".mp4"), hasAudio: false }];
    } else if (url.includes("gfycat.com")) {
      return [
        {
          source: `https://web.archive.org/web/0if_/thumbs.${url.split("https://")[1]}-mobile.mp4`,
          hasAudio: false,
        },
      ];
    } else if (url.includes("redgifs.com")) {
      return [await Redgifs.getMedia(url)];
    }
  }
  return [];
}

export function formatAuthorFlair(authorFlair: any): Flair | null {
  if (!authorFlair) return null;
  const emojis: string[] = [];
  let text: string | undefined;
  try {
    for (const part of JSON.parse(authorFlair.richtext ?? "[]")) {
      if (part?.e === "emoji") emojis.push(part.u);
      else if (part?.e === "text") text = part.t?.trim();
    }
  } catch (_e) {
    // Fall back to the plain text below.
  }
  if (!text && !emojis.length && authorFlair.text) {
    text = authorFlair.text;
  }
  return emojis.length || text ? { emojis, text } : null;
}

function formatPostFlair(flair: any): PostFlair | null {
  if (!flair?.text) return null;
  return {
    id: flair.template?.id ?? "",
    text: flair.text,
  };
}

function formatPoll(poll: any): Poll | undefined {
  if (!poll?.options) return undefined;
  return {
    voteCount: poll.options.reduce(
      (total: number, option: any) => total + (option.voteCount ?? 0),
      0,
    ),
    options: poll.options.map((option: any) => ({
      id: option.id,
      text: option.text,
    })),
  };
}

export function formatVote(voteState?: string): VoteOption {
  if (voteState === "UP") return VoteOption.UpVote;
  if (voteState === "DOWN") return VoteOption.DownVote;
  return VoteOption.NoVote;
}

export async function formatPost(post: any): Promise<Post> {
  const images = formatImages(post);
  const imageThumbnail = images.at(0)?.at(0) ?? null;

  // default in case we can't get the aspect ratio
  let mediaAspectRatio = 0.75;
  if (imageThumbnail?.width && imageThumbnail?.height) {
    mediaAspectRatio = imageThumbnail.width / imageThumbnail.height;
  }

  const videos = await formatVideos(post);
  const id = post.id.replace(/^t3_/, "");
  // Posts to a user's profile (ProfilePost) have a profile (u_<name>) instead.
  const community = post.subreddit ?? post.profile;
  const subreddit = community?.name ?? "";
  // Posts deleted by their author (DeletedSubredditPost) only have their id,
  // title, date, comment count and subreddit, like old Reddit's [deleted].
  const isDeleted = post.__typename === "DeletedSubredditPost";
  const permalink = `https://www.reddit.com${
    post.permalink ?? `/r/${subreddit}/comments/${id}/`
  }`;

  // Link classification: links to other posts, to Reddit pages, or outside.
  let openGraphData: OpenGraphData | undefined = undefined;
  let externalLink: string | undefined = undefined;
  let crossCommentLink: string | undefined = undefined;
  const postURL: string = post.url ?? "";
  const { url, isValid } = RedditURL.getURLIfValid(postURL);
  if (isValid) {
    // Self posts link to themselves; their url is percent-encoded while
    // permalink isn't, so non-ASCII titles wouldn't match below.
    if (
      !post.isSelfPost &&
      postURL.includes("/comments/") &&
      !postURL.includes(post.permalink)
    ) {
      crossCommentLink = url;
    } else if (url.includes("/r/") && !url.includes(`/r/${subreddit}`)) {
      // Link posts that point to other posts or subreddits but are not cross posts
      externalLink = url;
    }
  } else if (postURL) {
    externalLink = postURL;
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

  const crossPostSource = post.crosspostRoot?.post;
  const crossPost =
    crossPostSource && crossPostSource.id !== post.id
      ? await formatPost(crossPostSource)
      : undefined;

  const createdAt = post.createdAt ? parseTime(post.createdAt) : 0;
  return {
    id,
    name: post.id,
    type: "post",
    crossPost,
    crossCommentLink,
    title: post.postTitle ?? post.title ?? "",
    author: post.authorInfo?.name ?? "[deleted]",
    upvotes: post.score ?? 0,
    saved: post.isSaved ?? false,
    userVote: formatVote(post.voteState),
    flair: formatAuthorFlair(post.authorFlair),
    postFlair: formatPostFlair(post.flair),
    subreddit,
    subredditIcon:
      community?.styles?.icon?.split("?")?.[0] ??
      community?.styles?.legacyIcon?.url ??
      "",
    isModerator: post.distinguishedAs === "MODERATOR",
    isStickied: post.isStickied ?? false,
    isNSFW: post.isNsfw ?? false,
    isSpoiler: post.isSpoiler ?? false,
    interactionDisabledStatus: post.isArchived
      ? "archived"
      : post.isLocked
        ? "locked"
        : null,
    text: isDeleted ? "[deleted]" : (post.content?.markdown ?? ""),
    // content.html is plain text, so build the HTML from richtext.
    html: isDeleted
      ? '<div class="md"><p>[deleted]</p></div>'
      : post.content
        ? contentToHtml(post.content, id)
        : "",
    commentCount: post.commentCount ?? 0,
    link: permalink,
    images,
    imageThumbnail,
    mediaAspectRatio,
    videos,
    poll: formatPoll(post.poll),
    externalLink,
    openGraphData,
    timeSince: createdAt
      ? new Time(createdAt * 1000).prettyTimeSince() + " ago"
      : "",
    after: post.id,
  };
}

type FeedQuery = {
  operation: GqlOperation;
  variables: Record<string, any>;
};

/**
 * Picks the app's feed query for a feed URL. Combined subreddits
 * (r/pics+news) have no equivalent in Reddit's app and fail like a
 * nonexistent subreddit.
 */
function getFeedQuery(redditURL: RedditURL): FeedQuery {
  const [sort, time] = redditURL.getSort();
  const sortVariables = (defaultSort: string) => ({
    sort: (sort ?? defaultSort).toUpperCase(),
    ...(time ? { time: time.toUpperCase() } : {}),
  });

  switch (redditURL.getPageType()) {
    case PageType.HOME:
      return { operation: HomeFeedSdui, variables: sortVariables("best") };
    case PageType.SUBREDDIT: {
      const subreddit = redditURL.getSubreddit();
      if (subreddit.toLowerCase() === "popular") {
        return { operation: PopularFeedSdui, variables: sortVariables("hot") };
      }
      if (subreddit.toLowerCase() === "all") {
        return { operation: AllFeedSdui, variables: sortVariables("hot") };
      }
      return {
        operation: SubredditFeedSdui,
        variables: { subredditName: subreddit, ...sortVariables("hot") },
      };
    }
    case PageType.MULTIREDDIT: {
      const [user, name] = redditURL.getMultiredditPath().split("/");
      return {
        operation: CustomFeedSdui,
        variables: { path: `/user/${user}/m/${name}`, ...sortVariables("hot") },
      };
    }
    default:
      throw new Error(`Not a post feed: ${redditURL.toString()}`);
  }
}

/**
 * Returns the post ids on one page of a feed. Unavailable feeds (e.g. a
 * subreddit that doesn't exist) have no ids.
 */
async function getFeedPostIds(
  query: FeedQuery,
  after?: string,
): Promise<string[]> {
  const data = await gql(query.operation, {
    ...query.variables,
    // Feed cursors are base64 encoded post fullnames.
    ...(after ? { after: btoa(after) } : {}),
  });
  const root: any = Object.values(data ?? {})[0];
  return sduiPostIds(root?.elements?.edges);
}

/**
 * The post ids in a server-driven (SDUI) feed's edges: posts arrive as groups
 * of UI cells named by the post's id, among ads and other elements.
 */
export function sduiPostIds(edges: any[] | undefined): string[] {
  return (edges ?? [])
    .map((edge: any) => edge?.node)
    .filter((node: any) => node && !node.adPayload)
    .map((node: any) => node.groupId ?? node.id)
    .filter((id: unknown) => typeof id === "string" && id.startsWith("t3_"));
}

/**
 * Post feeds: the home feed,
 * subreddits (including r/popular and r/all) and multireddits.
 *
 * Page sizes are chosen by Reddit (currently 6 on the first page, 24 after).
 */
export async function getPosts(
  url: string,
  options: GetPostOptions = {},
): Promise<Post[]> {
  const redditURL = new RedditURL(url);
  const query = getFeedQuery(redditURL);

  let ids: string[];
  if (query.operation === SubredditFeedSdui && !options.after) {
    // Check the subreddit's status alongside its first page, like Reddit's
    // app does when it opens a subreddit.
    const [firstPageIds, access] = await Promise.all([
      getFeedPostIds(query),
      checkSubredditAccess(redditURL.getSubreddit()),
    ]);
    if (access === "declined") return [];
    // Quarantined subreddits come back empty until the user opts in; gated
    // ones don't.
    ids =
      access === "optedIn" && !firstPageIds.length
        ? await getFeedPostIds(query)
        : firstPageIds;
  } else {
    ids = await getFeedPostIds(query, options.after);
  }
  return await getPostsByIds(ids);
}

/**
 * Posts in subreddits and on user profiles, including ones deleted by their
 * author (shown as [deleted]). Leaves out unavailable posts and ads.
 */
export function isPost(post: any): boolean {
  return (
    post?.__typename === "SubredditPost" ||
    post?.__typename === "ProfilePost" ||
    post?.__typename === "DeletedSubredditPost"
  );
}

/**
 * Fetches posts like Reddit's app does after loading a feed page. Returns the
 * raw GraphQL posts (for formatPost), skipping unavailable ones.
 */
export async function getRawPostsByIds(ids: string[]): Promise<any[]> {
  return (await getPostInfosByIds(ids)).filter(isPost);
}

/** PostsByIds' results as Reddit returns them, unavailable posts included. */
export async function getPostInfosByIds(ids: string[]): Promise<any[]> {
  if (!ids.length) return [];
  const data = await gql(PostsByIds, { ...POSTS_BY_IDS_VARIABLES, ids });
  return data.postsInfoByIds ?? [];
}

/** Fetches and formats posts by id (t3_...), skipping unavailable ones. */
export async function getPostsByIds(ids: string[]): Promise<Post[]> {
  return await formatPosts(await getRawPostsByIds(ids));
}

/** Formats a list's posts, skipping unavailable ones and ads. */
export async function formatPosts(nodes: any[]): Promise<Post[]> {
  return await Promise.all(
    nodes.filter(isPost).map((post) => formatPost(post)),
  );
}
