const REDDIT_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.reddit\.com|old\.reddit\.com|reddit\.com|redd\.it)\/\S+/i;

export default function extractRedditURL(text: string | null | undefined) {
  if (!text) return null;

  const match = text.match(REDDIT_URL_REGEX)?.[0];
  if (!match) return null;

  return match.trim().replace(/[),.;!?]+$/, "");
}
