export type Flair = {
  emojis: string[];
  text?: string;
};

export function formatFlair(redditData: any): Flair | null {
  const emojis: string[] = [];
  let text: string | undefined;
  if (redditData && Array.isArray(redditData.author_flair_richtext)) {
    for (const flair of redditData.author_flair_richtext) {
      if (typeof flair !== "object") {
        continue;
      } else if (flair.e === "emoji") {
        emojis.push(flair.u);
      } else if (flair.e === "text") {
        text = flair.t?.trim();
      }
    }
  }
  if (
    !text &&
    !emojis.length &&
    typeof redditData.author_flair_text === "string"
  ) {
    text = redditData.author_flair_text;
  }
  if (emojis.length > 0 || text) {
    return {
      emojis,
      text,
    };
  }
  return null;
}
