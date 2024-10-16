import { AntDesign } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";

import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

type SearchBarProps = {
  onSearch: (text: string) => void;
  onChangeText?: (text: string) => void;
};

export default function SearchBar({ onSearch, onChangeText }: SearchBarProps) {
  const { theme } = useContext(ThemeContext);
  const [search, setSearch] = useState<string>("");

  return (
    <View
      style={t(styles.searchBarContainer, {
        backgroundColor: theme.tint,
      })}
    >
      <AntDesign
        name="search1"
        size={18}
        color={theme.text}
        style={styles.searchBarIcon}
      />
      <TextInput
        style={t(styles.searchBar, {
          color: theme.text,
        })}
        returnKeyType="search"
        value={search}
        onChangeText={text => {
          setSearch(text);
          onChangeText?.(text);
        }}
        onBlur={() => onSearch(search)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarContainer: {
    marginVertical: 10,
    marginHorizontal: 5,
    padding: 7,
    paddingLeft: 10,
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  searchBarIcon: {
    marginRight: 5,
  },
  searchBar: {
    flex: 1,
    fontSize: 18,
  },
});
