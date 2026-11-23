import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import React, { useContext } from "react";
import { StyleSheet, Text } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import {
  TRANSLATION_LANGUAGE_KEY,
  TRANSLATION_LANGUAGES,
} from "../../../api/gql/Translation";
import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";

export default function Translation() {
  const { theme } = useContext(ThemeContext);
  const [storedLanguage, setLanguage] = useMMKVString(TRANSLATION_LANGUAGE_KEY);
  const language = storedLanguage ?? "";

  return (
    <>
      <List
        title="Translate Other Languages Into"
        items={TRANSLATION_LANGUAGES.map(({ label, value }) => ({
          key: value || "off",
          text: label,
          rightIcon:
            value === language ? (
              <MaterialCommunityIcons
                name="check"
                size={24}
                color={theme.text}
                // Like List's own icons: don't let it change the row height.
                style={styles.check}
              />
            ) : (
              <></>
            ),
          onPress: () => setLanguage(value),
        }))}
      />
      <Text style={[styles.textDescription, { color: theme.text }]}>
        Reddit translates titles, posts and comments written in other languages
        into the language you choose. For example, choose English to read German
        or Japanese posts and comments in English. Content that's already in
        your language is left as is.
        {"\n\n"}
        The first time anyone reads a thread in your language, Reddit needs a
        moment to translate its comments, usually less than 10 seconds. Until
        then, Hydra shows them in their original language so none are missing.
        Pull down to refresh the post after a few seconds to see them
        translated.
        {"\n\n"}
        Your own new replies and edits show in the language you wrote them in.
        {"\n\n"}
        Only the languages Reddit can translate into are listed.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  check: {
    marginVertical: -100,
  },
  textDescription: {
    margin: 15,
    lineHeight: 20,
  },
});
