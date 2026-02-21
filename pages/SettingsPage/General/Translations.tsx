import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { TranslationSettingsContext, SUPPORTED_LANGUAGES } from "../../../contexts/SettingsContexts/TranslationSettingsContext";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import { useSettingsPicker } from "../../../utils/useSettingsPicker";

export default function Translations() {
  const { theme } = useContext(ThemeContext);
  const { sourceLanguage, targetLanguage, setSourceLanguage, setTargetLanguage } = useContext(TranslationSettingsContext);
  const { isPro } = useContext(SubscriptionsContext);

  const sourceLanguageOptions = SUPPORTED_LANGUAGES.map(lang => ({
    label: lang.name,
    value: lang.code,
  }));

  const targetLanguageOptions = SUPPORTED_LANGUAGES.filter(lang => lang.code !== "auto").map(lang => ({
    label: lang.name,
    value: lang.code,
  }));

  const {
    openPicker: openSourceLanguagePicker,
    rightIcon: rightIconSourceLanguage,
  } = useSettingsPicker({
    items: sourceLanguageOptions,
    value: sourceLanguage,
    onChange: (newValue) => {
      if (isPro) {
        setSourceLanguage(newValue);
      }
    },
  });

  const {
    openPicker: openTargetLanguagePicker,
    rightIcon: rightIconTargetLanguage,
  } = useSettingsPicker({
    items: targetLanguageOptions,
    value: targetLanguage,
    onChange: (newValue) => {
      if (isPro) {
        setTargetLanguage(newValue);
      }
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <List
        title="Languages"
        items={[
          {
            key: "sourceLanguage",
            icon: <MaterialCommunityIcons name="translate" size={24} color={theme.text} />,
            text: "Source Language",
            rightIcon: rightIconSourceLanguage,
            onPress: () => {
              if (isPro) {
                openSourceLanguagePicker();
              }
            },
          },
          {
            key: "targetLanguage",
            icon: <MaterialCommunityIcons name="translate" size={24} color={theme.text} />,
            text: "Target Language",
            rightIcon: rightIconTargetLanguage,
            onPress: () => {
              if (isPro) {
                openTargetLanguagePicker();
              }
            },
          },
        ]}
      />
      {!isPro && (
        <View style={styles.proNotice}>
          <MaterialCommunityIcons name="crown" size={20} color={theme.pro} />
          <List
            items={[
              {
                key: "pro",
                text: "Upgrade to Pro to use translation features",
                icon: <MaterialCommunityIcons name="crown" size={24} color={theme.pro} />,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  proNotice: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
});
