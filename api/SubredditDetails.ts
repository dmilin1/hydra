import { decode } from "html-entities";
import { api } from "./RedditApi";

export type Rule = {
  name: string;
  descriptionHTML: string;
};

export type Sidebar = {
  subscribers: number;
  descriptionHTML: string;
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
