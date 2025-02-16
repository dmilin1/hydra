import { MaterialIcons } from "@expo/vector-icons";
import React, { useContext, useRef } from "react";
import { useMMKVString } from "react-native-mmkv";
import RNPickerSelect from "react-native-picker-select";

import List from "../../../components/UI/List";
import Picker from "../../../components/UI/Picker";
import {
  INITIAL_TAB_STORAGE_KEY,
  TabIndices,
} from "../../../contexts/NavigationContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";

const INITIAL_TAB_OPTIONS = Object.keys(TabIndices);

export default function General() {
  const { theme } = useContext(ThemeContext);

  const initialTabRef = useRef<RNPickerSelect>(null);

  const [storedInitialTab, setInitialTab] = useMMKVString(
    INITIAL_TAB_STORAGE_KEY,
  );
  const initialTab = storedInitialTab ?? "Posts";

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
            rightIcon: (
              <Picker
                ref={initialTabRef}
                onValueChange={(value: string) => {
                  if (value) {
                    setInitialTab(value);
                  }
                }}
                items={INITIAL_TAB_OPTIONS.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={initialTab}
              />
            ),
            onPress: () => initialTabRef.current?.togglePicker(true),
          },
        ]}
      />
    </>
  );
}
