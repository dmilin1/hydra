import { TextStyle } from "react-native";

export type TextDirection = "ltr" | "rtl";

/**
 * Strongly directional character ranges, adapted from Closure's bidi
 * utilities. Anything outside both ranges (digits, punctuation, emoji,
 * whitespace) is neutral and doesn't decide a paragraph's direction. The
 * escapes are double backslashed so formatters can't turn them into
 * invisible literal characters.
 */
const LTR_CHARS =
  "A-Za-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02B8\\u0300-\\u0590" +
  "\\u0900-\\u1FFF\\u200E\\u2C00-\\uD801\\uD804-\\uD839\\uD840-\\uDBFF" +
  "\\uF900-\\uFB1C\\uFE00-\\uFE6F\\uFEFD-\\uFFFF";
const RTL_CHARS =
  "\\u0591-\\u06EF\\u06FA-\\u08FF\\u200F\\uD802-\\uD803\\uD83A-\\uD83B" +
  "\\uFB1D-\\uFDFF\\uFE70-\\uFEFC";

const FIRST_STRONG_CHAR = new RegExp(`[${LTR_CHARS}${RTL_CHARS}]`);
const RTL_CHAR = new RegExp(`[${RTL_CHARS}]`);

/**
 * Matches the behavior of dir="auto" in HTML: the direction is decided by
 * the first strongly directional character. Returns null when the text has
 * no strong characters so callers can fall back to the surrounding direction.
 */
export function getTextDirection(text: string): TextDirection | null {
  const firstStrong = text.match(FIRST_STRONG_CHAR)?.[0];
  if (!firstStrong) return null;
  return RTL_CHAR.test(firstStrong) ? "rtl" : "ltr";
}

const RTL_TEXT_STYLE: TextStyle = {
  textAlign: "right",
  writingDirection: "rtl",
};

/**
 * Style to apply to a block of user generated text (titles, bodies) so that
 * Hebrew, Arabic, Persian, etc. are aligned and laid out right to left.
 */
export function textDirectionStyle(text: string | undefined | null) {
  return text && getTextDirection(text) === "rtl" ? RTL_TEXT_STYLE : undefined;
}
