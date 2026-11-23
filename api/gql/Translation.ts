import KeyStore from "../../utils/KeyStore";

/**
 * Reddit machine translates posts and comments on its servers when a request
 * carries `X-Reddit-Translations: enabled, seo, <language>`, like its app
 * does. Codes outside this list are silently ignored, so they're the only
 * choices. Spanish only works as Latin American Spanish (es-419).
 */
export const TRANSLATION_LANGUAGES = [
  { label: "Don't Translate", value: "" },
  { label: "English", value: "en" },
  { label: "Deutsch", value: "de" },
  { label: "Español", value: "es-419" },
  { label: "Filipino", value: "fil" },
  { label: "Français", value: "fr" },
  { label: "Italiano", value: "it" },
  { label: "Nederlands", value: "nl" },
  { label: "Polski", value: "pl" },
  { label: "Português (BR)", value: "pt-BR" },
  { label: "Svenska", value: "sv" },
  { label: "हिन्दी", value: "hi" },
  { label: "ไทย", value: "th" },
  { label: "日本語", value: "ja" },
  { label: "中文（简体）", value: "zh-Hans" },
  { label: "中文（繁體）", value: "zh-Hant" },
];

export const TRANSLATION_LANGUAGE_KEY = "translationLanguage";

export function getTranslationLanguage(): string | undefined {
  return KeyStore.getString(TRANSLATION_LANGUAGE_KEY) || undefined;
}
