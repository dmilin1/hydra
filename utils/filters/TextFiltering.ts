import { Comment } from "../../api/PostDetail";
import { Post } from "../../api/Posts";

export type TextFilterMap = {
  [char: string]: TextFilterMap;
} & {
  isEndOfWord?: true;
};

export function makeTextFilterMap(filterText: string): TextFilterMap {
  const words = filterText
    .toLocaleLowerCase()
    .split(/, |\n|,/)
    .filter((word) => word.length > 0)
    .map((word) => word.trim());

  const filterMap: TextFilterMap = {};
  for (const word of words) {
    let currentMap = filterMap;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (currentMap[char] === undefined) {
        currentMap[char] = {};
      }
      currentMap = currentMap[char];
    }
    currentMap.isEndOfWord = true;
  }
  return filterMap;
}

export function doesTextPassTextFilter(
  filterMap: TextFilterMap,
  text: string,
): boolean {
  const lowerText = text.toLocaleLowerCase();
  for (let i = 0; i < lowerText.length; i++) {
    let currentMap: TextFilterMap = filterMap;
    let word = "";
    for (let j = i; j < lowerText.length; j++) {
      const char = lowerText[j];
      if (currentMap[char] === undefined) {
        break;
      }
      currentMap = currentMap[char];
      word += char;
      if (currentMap.isEndOfWord) {
        const nextChar = lowerText[j + 1];
        const nextCharIsNonWord = !nextChar || nextChar.match(/\W/);
        const prevChar = lowerText[j - word.length];
        const prevCharIsNonWord = !prevChar || prevChar.match(/\W/);
        if (nextCharIsNonWord && prevCharIsNonWord) {
          return false;
        }
      }
    }
  }
  return true;
}

export function doesPostPassTextFilterMap(
  filterMap: TextFilterMap,
  post: Post,
): boolean {
  const postText = [
    post.title,
    post.author,
    post.text,
    post.poll?.options.map((option) => option.text).join(" "),
    post.openGraphData?.title,
    post.openGraphData?.description,
  ]
    .filter((text) => text)
    .join(" ");
  return doesTextPassTextFilter(filterMap, postText);
}

export function doesCommentPassTextFilterMap(
  filterMap: TextFilterMap,
  comment: Comment,
): boolean {
  const commentText = [comment.text, comment.author]
    .filter((text) => text)
    .join(" ");
  return doesTextPassTextFilter(filterMap, commentText);
}
