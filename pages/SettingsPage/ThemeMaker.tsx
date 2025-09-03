import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import {
  Theme,
  CustomThemeColorKeys,
  NEW_CUSTOM_THEME,
} from "../../constants/Themes";
import { useNavigation } from "@react-navigation/native";
import {
  getCustomTheme,
  saveCustomTheme,
} from "../../db/functions/CustomThemes";
import ColorPicker from "../../components/UI/Themes/ColorPicker";

type ColorGroups = Record<
  | "Core Colors"
  | "Interactive Elements"
  | "Text Hierarchy"
  | "Icons"
  | "Actions",
  { field: CustomThemeColorKeys; label: string; description: string }[]
>;
type ColorGroupKey = keyof ColorGroups;
type ColorGroupItem = ColorGroups[ColorGroupKey];

const COLOR_GROUPS = {
  "Text Hierarchy": [
    {
      field: "text",
      label: "Text",
      description: "Primary text items, post titles, headers, some icons",
    },
    {
      field: "subtleText",
      label: "Subtle Text",
      description:
        "Non primary text elements like post details, comment sections, etc.",
    },
    {
      field: "verySubtleText",
      label: "Very Subtle Text",
      description: "Low importance text like text input placeholders",
    },
  ],
  "Core Colors": [
    {
      field: "background",
      label: "Background",
      description: "Background of most screens.",
    },
    {
      field: "tint",
      label: "Tint",
      description:
        "Background of popups, text inputs, button groups, low contrast borders",
    },
    {
      field: "divider",
      label: "Divider",
      description:
        "Divider between items, high contrast borders, high contrast backgrounds like flairs, message bubbles, etc.",
    },
  ],
  "Interactive Elements": [
    {
      field: "buttonBg",
      label: "Button Background",
      description:
        "Background of big primary action buttons like the floating next comment button",
    },
    {
      field: "buttonText",
      label: "Button Text",
      description: "Text of big primary action buttons",
    },
    {
      field: "iconOrTextButton",
      label: "Icon/Text Button",
      description:
        "Buttons that are just text without a container like navbar text buttons",
    },
  ],
  Icons: [
    {
      field: "iconPrimary",
      label: "Primary Icon",
      description:
        "Keep this the same as Icon/Text Button. It does the same thing. Will probably be removed soon.",
    },
    {
      field: "iconSecondary",
      label: "Secondary Icon",
      description:
        "Keep this the same as Subtle Text. Off mode color for switches (poorly named), will probably be removed soon.",
    },
  ],
  Actions: [
    {
      field: "upvote",
      label: "Upvote",
      description:
        "Color of the upvote button, slider, and other upvote related elements",
    },
    {
      field: "downvote",
      label: "Downvote",
      description:
        "Color of the downvote button, slider, and other downvote related elements",
    },
    {
      field: "delete",
      label: "Delete",
      description:
        "Color of the delete button, slider, and other delete related elements",
    },
    {
      field: "showHide",
      label: "Show/Hide",
      description:
        "Color of the show/hide slider and other show/hide related elements",
    },
    {
      field: "reply",
      label: "Reply",
      description: "Color of the reply slider and other reply related elements",
    },
    {
      field: "share",
      label: "Share",
      description: "Color of the share slider and other share related elements",
    },
    {
      field: "bookmark",
      label: "Bookmark",
      description:
        "Color of the bookmark slider and other bookmark related elements",
    },
    {
      field: "moderator",
      label: "Moderator",
      description:
        "Color of moderator usernames and other moderator related elements",
    },
  ],
};

export default function ThemeMaker() {
  const { baseTheme, customThemeData, setCustomThemeData, setCurrentTheme } =
    useContext(ThemeContext);
  const navigation = useNavigation();
  const [selectedColorField, setSelectedColorField] =
    useState<CustomThemeColorKeys>("background");
  const [selectedColorGroup, setSelectedColorGroup] =
    useState<keyof ColorGroups>("Text Hierarchy");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSelectColorField = (field: CustomThemeColorKeys) => {
    setSelectedColorField(field);
  };

  const saveTheme = () => {
    const doSave = () => {
      saveCustomTheme(customThemeData);
      setCurrentTheme(customThemeData.name);
      Alert.alert("Success", "Theme saved successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    };
    if (!customThemeData.name.trim()) {
      Alert.alert("Error", "Please enter a theme name");
      return;
    }
    if (getCustomTheme(customThemeData.name)) {
      Alert.alert(
        "Important",
        "Another theme with this name already exists. Do you want to overwrite it?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Overwrite",
            style: "destructive",
            onPress: () => doSave(),
          },
        ],
      );
      return;
    }
    doSave();
  };

  useEffect(() => {
    setCustomThemeData({ ...NEW_CUSTOM_THEME, extends: baseTheme.key });
    return () =>
      setCustomThemeData({ ...NEW_CUSTOM_THEME, extends: baseTheme.key });
  }, []);

  return (
    <ScrollView
      style={styles.mainContent}
      contentContainerStyle={{ backgroundColor: baseTheme.background }}
    >
      <ColorPicker
        show={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        currentColor={customThemeData[selectedColorField] || "#000000"}
        onChange={(color) =>
          setCustomThemeData({
            ...customThemeData,
            [selectedColorField]: color,
          })
        }
      />
      <View style={styles.editorSection}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: baseTheme.text }]}>
            Theme Name
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: baseTheme.text, borderColor: baseTheme.divider },
            ]}
            value={customThemeData.name}
            onChangeText={(text) =>
              setCustomThemeData({ ...customThemeData, name: text })
            }
            placeholder="Enter theme name"
            placeholderTextColor={baseTheme.subtleText}
          />
        </View>

        <View style={styles.modeSection}>
          <Text style={[styles.label, { color: baseTheme.text }]}>UI Mode</Text>
          <Text style={[styles.description, { color: baseTheme.subtleText }]}>
            Controls whether the picker, scroll bars, and splash screen display
            in light or dark mode.
          </Text>
          <View style={styles.modeButtons}>
            {(["light", "dark"] as Theme["systemModeStyle"][]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  {
                    borderColor:
                      customThemeData.systemModeStyle === mode
                        ? baseTheme.iconOrTextButton
                        : baseTheme.divider,
                  },
                ]}
                onPress={() =>
                  setCustomThemeData({
                    ...customThemeData,
                    systemModeStyle: mode,
                  })
                }
              >
                <Text
                  style={{
                    color:
                      customThemeData.systemModeStyle === mode
                        ? "#fff"
                        : baseTheme.text,
                  }}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.modeSection}>
          <Text style={[styles.label, { color: baseTheme.text }]}>
            Status Bar
          </Text>
          <Text style={[styles.description, { color: baseTheme.subtleText }]}>
            Controls whether the system status bar at the top with the time and
            battery displays in light or dark mode.
          </Text>
          <View style={styles.modeButtons}>
            {(["light", "dark"] as Theme["statusBar"][]).map((bar) => (
              <TouchableOpacity
                key={bar}
                style={[
                  styles.modeButton,
                  {
                    borderColor:
                      customThemeData.statusBar === bar
                        ? baseTheme.iconOrTextButton
                        : baseTheme.divider,
                  },
                ]}
                onPress={() =>
                  setCustomThemeData({ ...customThemeData, statusBar: bar })
                }
              >
                <Text
                  style={{
                    color:
                      customThemeData.statusBar === bar
                        ? "#fff"
                        : baseTheme.text,
                  }}
                >
                  {bar}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.label, { color: baseTheme.text }]}>
          Color Groups
        </Text>
        <Text style={[styles.description, { color: baseTheme.subtleText }]}>
          Colors used by various elements of the app.
        </Text>
        <View style={styles.colorGroupsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.colorGroupsScroll}
            contentContainerStyle={styles.colorGroupsScrollContent}
          >
            {(Object.keys(COLOR_GROUPS) as ColorGroupKey[]).map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.colorGroupButton,
                  {
                    borderColor:
                      selectedColorGroup === group
                        ? baseTheme.iconOrTextButton
                        : baseTheme.divider,
                  },
                ]}
                onPress={() => setSelectedColorGroup(group)}
              >
                <Text style={{ color: baseTheme.text }}>{group}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.colorFieldsContainer}>
          {(COLOR_GROUPS[selectedColorGroup] as ColorGroupItem).map(
            ({ field, label, description }) => (
              <TouchableOpacity
                key={field}
                style={[
                  styles.colorFieldButton,
                  { borderColor: baseTheme.divider },
                ]}
                onPress={() => {
                  handleSelectColorField(field);
                  setShowColorPicker(true);
                }}
              >
                <View style={[styles.colorFieldInfo]}>
                  <Text
                    style={[styles.colorFieldLabel, { color: baseTheme.text }]}
                  >
                    {label}
                    {!customThemeData[field] ? " (default)" : ""}
                  </Text>
                  <Text
                    style={[
                      styles.colorFieldDescription,
                      { color: baseTheme.subtleText },
                    ]}
                  >
                    {description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: customThemeData[field],
                      borderColor: baseTheme.text,
                    },
                  ]}
                />
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={[styles.description, { color: baseTheme.subtleText }]}>
          You can preview your changes by navigating to other tabs in the app.
          This screen will not reflect your changes to ensure usability. Changes
          will persist until you leave the Theme Maker.
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => saveTheme()}
        activeOpacity={0.5}
        style={[
          styles.buttonContainer,
          {
            backgroundColor: baseTheme.buttonBg,
          },
        ]}
      >
        <View style={styles.buttonSubContainer}>
          <Text
            style={[
              styles.buttonText,
              {
                color: baseTheme.buttonText,
              },
            ]}
          >
            Save Theme
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
  },
  editorSection: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modeSection: {
    marginBottom: 24,
  },
  modeButtons: {
    flexDirection: "row",
    gap: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  colorGroupsContainer: {
    marginBottom: 16,
  },
  colorGroupsScroll: {
    flexDirection: "row",
  },
  colorGroupsScrollContent: {
    gap: 16,
  },
  colorGroupButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorFieldsContainer: {
    gap: 16,
  },
  colorFieldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 12,
  },
  colorFieldInfo: {
    flexShrink: 1,
    flexDirection: "column",
    gap: 4,
  },
  colorFieldLabel: {
    fontSize: 16,
  },
  colorFieldDescription: {
    fontSize: 13,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailsContainer: {
    marginHorizontal: 20,
  },
  buttonContainer: {
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  buttonSubContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
  },
});
