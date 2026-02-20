import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { forwardRef, useContext, useRef, useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type SearchBarProps = {
  initialSearch?: string;
  clearOnSearch?: boolean;
  searchOnBlur?: boolean;
  onSearch: (text: string) => void;
  placeholder?: string;
};

const SearchBar = forwardRef<TextInput, SearchBarProps>(function SearchBar(
  { initialSearch, clearOnSearch, onSearch, searchOnBlur = true, placeholder },
  ref,
) {
  const { theme } = useContext(ThemeContext);
  const search = useRef<string>("");
  const prevSearch = useRef<string>("");
  const textInputRef = useRef<TextInput | null>(null);
  const [showX, setShowX] = useState(!!initialSearch);

  const doSearch = () => {
    if (search.current !== prevSearch.current) {
      onSearch(search.current);
      prevSearch.current = search.current;
    }
    if (clearOnSearch) {
      search.current = "";
      textInputRef.current?.clear();
      setShowX(false);
      prevSearch.current = "";
    }
  };

  return (
    <View
      style={[
        styles.searchBarContainer,
        {
          backgroundColor: theme.tint,
        },
      ]}
    >
      <Feather
        name="search"
        size={18}
        color={theme.text}
        style={styles.searchBarIcon}
      />
      <TextInput
        defaultValue={initialSearch}
        ref={(node) => {
          textInputRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        style={[
          styles.searchBar,
          {
            color: theme.text,
          },
        ]}
        returnKeyType="search"
        onChangeText={(text) => {
          search.current = text;
          setShowX(!!text);
        }}
        onSubmitEditing={() => doSearch()}
        onBlur={() => {
          if (!searchOnBlur) return;
          doSearch();
        }}
        placeholder={placeholder}
      />
      {showX && (
        <TouchableOpacity
          onPress={() => {
            search.current = "";
            textInputRef.current?.clear();
            setShowX(false);
            doSearch();
          }}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <FontAwesome6
            name="xmark-circle"
            size={18}
            color={theme.text}
            style={styles.xIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default SearchBar;

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
  xIcon: {
    marginRight: 5,
  },
});
