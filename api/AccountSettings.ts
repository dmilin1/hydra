import "react-native-url-polyfill/auto";
import {
  getAttributeValue,
  getElementById,
  getElementsByTagName,
  textContent,
} from "domutils";
import { parseDocument } from "htmlparser2";
import KeyStore from "../utils/KeyStore";
import { api } from "./RedditApi";

const LAST_FIXED_ACCOUNT_SETTINGS_KEY = "lastFixedAccountSettings";
const MIN_TIME_BETWEEN_FIX_ATTEMPTS = 1000 * 60 * 60 * 24 * 30; // 30 days

type Checkbox = "on" | "";

export type AccountSettings = {
  lang: string;
  newwindow: Checkbox;
  media: "on" | "off" | "subreddit";
  media_preview: "on" | "off" | "subreddit";
  video_autoplay: Checkbox;
  no_profanity: Checkbox;
  show_trending: Checkbox;
  clickgadget: Checkbox;
  compress: Checkbox;
  domain_details: Checkbox;
  hide_ups: Checkbox;
  hide_downs: Checkbox;
  numsites: "10" | "25" | "50" | "100";
  min_link_score: string;
  default_comment_sort:
    | "confidence"
    | "old"
    | "top"
    | "qa"
    | "controversial"
    | "new";
  ignore_suggested_sort: Checkbox;
  highlight_controversial: Checkbox;
  min_comment_score: string;
  num_comments: string;
  monitor_mentions: Checkbox;
  send_welcome_messages: Checkbox;
  threaded_modmail: Checkbox;
  live_orangereds: Checkbox;
  "disable-browser-notifs": Checkbox;
  "enable-notifs": Checkbox;
  unread_messages: Checkbox;
  chat_messages: Checkbox;
  trending_posts: Checkbox;
  community_recommendations: Checkbox;
  live_event: Checkbox;
  upvote_post: Checkbox;
  upvote_comment: Checkbox;
  email_digests: Checkbox;
  email_unsubscribe_all: Checkbox;
  show_stylesheets: Checkbox;
  show_flair: Checkbox;
  show_link_flair: Checkbox;
  legacy_search: Checkbox;
  show_presence: Checkbox;
  over_18: Checkbox;
  search_include_over_18: Checkbox;
  private_feeds: Checkbox;
  public_votes: Checkbox;
  beta: Checkbox;
  in_redesign_beta: Checkbox;
  highlight_new_comments: Checkbox;
};

function parseAccountSettings(html: string): AccountSettings {
  const dom = parseDocument(html);
  const form = getElementById("pref-form", dom);
  if (!form) {
    throw new Error("Could not find #pref-form in prefs page response");
  }

  const result: Record<string, string> = {};

  for (const input of getElementsByTagName("input", form)) {
    const name = getAttributeValue(input, "name");
    const type = getAttributeValue(input, "type");
    if (!name || type === "hidden" || type === "submit") continue;

    if (type === "checkbox") {
      result[name] = "checked" in input.attribs ? "on" : "";
    } else if (type === "radio") {
      if ("checked" in input.attribs) {
        result[name] = getAttributeValue(input, "value") ?? "";
      } else if (!(name in result)) {
        result[name] = "";
      }
    } else if (type === "text") {
      result[name] = getAttributeValue(input, "value") ?? "";
    }
  }

  for (const select of getElementsByTagName("select", form)) {
    const name = getAttributeValue(select, "name");
    if (!name) continue;

    const options = getElementsByTagName("option", select);
    const optionValue = (opt: (typeof options)[number]) =>
      "value" in opt.attribs
        ? (opt.attribs.value ?? "")
        : textContent(opt).trim();

    const selected = options.find((opt) => "selected" in opt.attribs);
    result[name] = selected
      ? optionValue(selected)
      : options.length > 0
        ? optionValue(options[0])
        : "";
  }

  return result as unknown as AccountSettings;
}

async function getAccountSettings(): Promise<AccountSettings> {
  const html = await api(
    "https://old.reddit.com/prefs",
    {},
    {
      dontJsonifyResponse: true,
    },
  );
  return parseAccountSettings(html);
}

async function setAccountSettings(settings: AccountSettings): Promise<void> {
  await api(
    "https://old.reddit.com/post/options",
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: settings,
      dontJsonifyResponse: true,
    },
  );
}

export async function fixIncompatibleAccountSettings() {
  const lastFixedAccountSettings =
    KeyStore.getNumber(LAST_FIXED_ACCOUNT_SETTINGS_KEY) ?? 0;
  if (lastFixedAccountSettings > Date.now() - MIN_TIME_BETWEEN_FIX_ATTEMPTS) {
    return;
  }
  KeyStore.set(LAST_FIXED_ACCOUNT_SETTINGS_KEY, Date.now());
  const settings = await getAccountSettings();
  if (settings.media !== "on") {
    await setAccountSettings({ ...settings, media: "on" });
  }
}
