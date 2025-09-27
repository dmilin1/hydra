import { decode } from "html-entities";
import { api } from "./RedditApi";
import * as Snudown from "../external/snudown";
import RedditURL from "../utils/RedditURL";

export type Rule = {
  name: string;
  descriptionHTML: string;
};

export type Sidebar = {
  subscribers: number;
  descriptionHTML: string;
};

export type Wiki = {
  contentHTML: string;
};

function formatSidebarData(data: any): Sidebar {
  return {
    subscribers: data.subscribers || 0,
    descriptionHTML: decode(data.description_html),
  };
}

export async function getSidebar(subreddit: string): Promise<Sidebar> {
  const data = await api(`https://www.reddit.com/r/${subreddit}/about.json`);
  return formatSidebarData(data.data);
}

function formatRulesData(data: any): Rule[] {
  return data.rules.map((rule: any) => ({
    name: rule.short_name,
    descriptionHTML: decode(rule.description_html),
  }));
}

export async function getRules(subreddit: string): Promise<Rule[]> {
  const data = await api(
    `https://www.reddit.com/r/${subreddit}/about/rules.json`,
  );
  return formatRulesData(data);
}

function formatWikiData(data: any): Wiki {
  return {
    // The API returns an HTML version, but getting the markdown and converting it seems to look better
    contentHTML: Snudown.markdown(decode(data.content_md)).replaceAll(
      />\s+</g,
      "><",
    ),
  };
}

export async function getWiki(url: string): Promise<Wiki> {
  const redditURL = new RedditURL(url);
  redditURL.jsonify();
  const data = await api(redditURL.toString());
  return formatWikiData(data.data);
}
