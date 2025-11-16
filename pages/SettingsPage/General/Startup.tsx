import { MaterialIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, Text } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import List from "../../../components/UI/List";
import SectionTitle from "../../../components/UI/SectionTitle";
import TextInput from "../../../components/UI/TextInput";
import {
  INITIAL_TAB_STORAGE_KEY,
  STARTUP_URL_DEFAULT,
  STARTUP_URL_STORAGE_KEY,
  TabIndices,
} from "../../../contexts/NavigationContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../../../utils/RedditURL";
import { useSettingsPicker } from "../../../utils/useSettingsPicker";

const INITIAL_TAB_OPTIONS = Object.keys(TabIndices);

export default function General() {
  const { theme } = useContext(ThemeContext);

  const [storedInitialTab, setInitialTab] = useMMKVString(
    INITIAL_TAB_STORAGE_KEY,
  );
  const initialTab = storedInitialTab ?? "Posts";

  const [startupURL, setStartupURL] = useMMKVString(STARTUP_URL_STORAGE_KEY);
  const initialStartupURL = startupURL ?? STARTUP_URL_DEFAULT;

  let startupURLIsValid = true;
  try {
    new RedditURL(initialStartupURL);
  } catch (_e) {
    startupURLIsValid = false;
  }

  const { openPicker: openInitialTabPicker, rightIcon: rightIconInitialTab } =
    useSettingsPicker({
      items: INITIAL_TAB_OPTIONS.map((option) => ({
        label: option,
        value: option,
      })),
      value: initialTab,
      onChange: setInitialTab,
    });

  return (
    <>
      <List
        title="Startup"
        items={[
          {
            key: "initialTab",
            icon: (
              <MaterialIcons
                name="open-in-browser"
                size={24}
                color={theme.text}
              />
            ),
            text: "Start Hydra on this tab",
            rightIcon: rightIconInitialTab,
            onPress: () => openInitialTabPicker(),
          },
        ]}
      />
      <SectionTitle text="Startup URL" />
      <TextInput
        style={[
          styles.startupURLText,
          {
            backgroundColor: theme.tint,
            borderColor: theme.divider,
            color: theme.text,
          },
        ]}
        value={initialStartupURL}
        onChangeText={setStartupURL}
      />
      {!startupURLIsValid && (
        <Text
          style={[
            styles.startupURLTextInvalid,
            {
              color: theme.text,
            },
          ]}
        >
          Invalid RedditURL. This setting will be ignored.
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  textDescription: {
    margin: 15,
    lineHeight: 20,
  },
  startupURLText: {
    marginHorizontal: 15,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    minHeight: 50,
  },
  startupURLTextInvalid: {
    marginHorizontal: 30,
    textAlign: "center",
    marginTop: 5,
  },
});
