import { createContext } from "react";
import { useMMKVString } from "react-native-mmkv";

export const SUPPORTED_LANGUAGES = [
  { code: "auto", name: "Auto Detect" },
  { code: "en", name: "English" },
  { code: "zh-Hant", name: "Chinese Traditional" },
  { code: "zh-Hans", name: "Chinese Simplified" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
] as const;

type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

const initialValues = {
  sourceLanguage: "auto" as LanguageCode,
  targetLanguage: "en" as LanguageCode,
};

const initialTranslationSettingsContext = {
  ...initialValues,
  setSourceLanguage: (_language: LanguageCode) => {},
  setTargetLanguage: (_language: LanguageCode) => {},
};

export const TranslationSettingsContext = createContext(
  initialTranslationSettingsContext,
);

export function TranslationSettingsProvider({
  children,
}: React.PropsWithChildren) {
  const [storedSourceLanguage, setSourceLanguage] = useMMKVString(
    "translationSourceLanguage",
  );
  const sourceLanguage = (storedSourceLanguage ?? initialValues.sourceLanguage) as LanguageCode;

  const [storedTargetLanguage, setTargetLanguage] = useMMKVString(
    "translationTargetLanguage",
  );
  const targetLanguage = (storedTargetLanguage ?? initialValues.targetLanguage) as LanguageCode;

  return (
    <TranslationSettingsContext.Provider
      value={{
        sourceLanguage,
        targetLanguage,
        setSourceLanguage,
        setTargetLanguage,
      }}
    >
      {children}
    </TranslationSettingsContext.Provider>
  );
}
