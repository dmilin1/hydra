import { AntDesign, Entypo, FontAwesome } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useContext, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  TextInputSelectionChangeEventData,
  Alert,
  Modal,
  ScrollView,
  Text,
} from "react-native";

import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import { CUSTOM_THEME_IMPORT_PREFIX, Theme } from "../../constants/Themes";

import ThemeList from "./ThemeList";

type MarkdownEditorProps = {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
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
  const [showThemeModal, setShowThemeModal] = useState(false);

  const selection = useRef<TextInputSelectionChangeEventData["selection"]>({
    start: 0,
    end: 0,
  });

  const handleThemeSelect = (themeData: Theme) => {
    Alert.alert(
      "Attach Theme",
      `Do you want to attach the "${themeData.name}" theme to your text?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Attach",
          onPress: () => {
            const themeImportString = `${CUSTOM_THEME_IMPORT_PREFIX}${JSON.stringify(themeData)}`;
            setText((text) => {
              const newText = replaceText(text, themeImportString, selection);
              return newText;
            });
            setShowThemeModal(false);
          },
        },
      ],
    );
  };

  const renderThemeModal = () => {
    try {
      return (
        <Modal
          visible={showThemeModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.divider }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Theme</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <FontAwesome name="times" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <ThemeList onSelect={(_key, themeData) => handleThemeSelect(themeData)} />
            </ScrollView>
          </View>
        </Modal>
      );
    } catch (error) {
      console.error('Error rendering theme modal:', error);
      return null;
    }
  };

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
        <TouchableOpacity onPress={() => setShowThemeModal(true)}>
          <FontAwesome name="paint-brush" size={24} color={theme.iconPrimary} />
        </TouchableOpacity>
      </View>
      {renderThemeModal()}
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
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 15,
    paddingBottom: 5,
  },
});
