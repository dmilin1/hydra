import { AntDesign, Entypo, FontAwesome } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useContext, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  TextInputSelectionChangeEventData,
  Alert,
} from "react-native";

import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

type MarkdownEditorProps = {
  text: string;
  setText: Dispatch<SetStateAction<string | undefined>>;
  placeholder: string;
};

const getSelected = (
  text: string,
  selection: React.MutableRefObject<
    TextInputSelectionChangeEventData["selection"]
  >,
) => {
  return text.slice(selection.current.start, selection.current.end);
};

const replaceText = (
  text: string,
  replacement: string,
  selection: React.MutableRefObject<
    TextInputSelectionChangeEventData["selection"]
  >,
) => {
  return (
    text.slice(0, selection.current.start) +
    replacement +
    text.slice(selection.current.end)
  );
};

export default function MarkdownEditor({
  text,
  setText,
  placeholder,
}: MarkdownEditorProps) {
  const { theme } = useContext(ThemeContext);

  const selection = useRef<TextInputSelectionChangeEventData["selection"]>({
    start: 0,
    end: 0,
  });

  return (
    <View
      style={t(styles.markdownEditorContainer, {
        backgroundColor: theme.background,
      })}
    >
      <TextInput
        style={t(styles.textInput, {
          color: theme.text,
        })}
        placeholder={placeholder}
        placeholderTextColor={theme.verySubtleText}
        multiline
        numberOfLines={4}
        value={text}
        onChangeText={setText}
        onSelectionChange={({ nativeEvent }) => {
          selection.current = nativeEvent.selection;
        }}
        scrollEnabled={false}
      />
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => {
            const selectedText = getSelected(text, selection);
            Alert.prompt("URL", undefined, (url: string) => {
              setText((text) =>
                replaceText(text, `[${selectedText}](${url})`, selection),
              );
            });
          }}
        >
          <AntDesign name="link" size={24} color={theme.iconPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const selectedText = getSelected(text, selection);
            setText((text) =>
              replaceText(text, `**${selectedText}**`, selection),
            );
          }}
        >
          <FontAwesome name="bold" size={24} color={theme.iconPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const selectedText = getSelected(text, selection);
            setText((text) =>
              replaceText(text, `*${selectedText}*`, selection),
            );
          }}
        >
          <FontAwesome name="italic" size={24} color={theme.iconPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (text === "") {
              // If no text, add a blockquote
              setText("> ");
            } else if (selection.current.start === selection.current.end) {
              // If no text is selected, add to start of current paragraph
              for (let i = selection.current.start; i > 0; i--) {
                if (text.slice(i - 1, i) === "\n") {
                  setText((text) =>
                    replaceText(text, `\n> ${getSelected(text, selection)}`, {
                      current: { start: i - 1, end: i },
                    }),
                  );
                  break;
                }
              }
            } else {
              // If text is selected, quote each line
              setText((text) => {
                const selectedText = getSelected(text, selection);
                return replaceText(
                  text,
                  selectedText
                    .split("\n")
                    .map((line) => `> ${line}`)
                    .join("\n"),
                  selection,
                );
              });
            }
          }}
        >
          <Entypo name="quote" size={24} color={theme.iconPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const selectedText = getSelected(text, selection);
            setText((text) =>
              replaceText(text, `~~${selectedText}~~`, selection),
            );
          }}
        >
          <FontAwesome
            name="strikethrough"
            size={24}
            color={theme.iconPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const selectedText = getSelected(text, selection);
            setText((text) =>
              replaceText(text, `>!${selectedText}!<`, selection),
            );
          }}
        >
          <FontAwesome name="eye-slash" size={24} color={theme.iconPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  markdownEditorContainer: {},
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    marginVertical: 5,
    minHeight: 100,
  },
  bottomBar: {
    height: 50,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});
