import React, { useContext, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import { Feather, AntDesign, FontAwesome, Octicons } from "@expo/vector-icons";
import { saveCustomTheme, ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { DEFAULT_THEME, ThemeData, Theme } from "../../constants/Themes";
import { useNavigation } from "@react-navigation/native";


type ColorGroup = {
    field: keyof Theme;
    label: string;
};

type ColorGroups = {
    [key: string]: ColorGroup[];
};

const COLOR_GROUPS: ColorGroups = {
    "Core Colors": [
        { field: "background", label: "Background" },
        { field: "text", label: "Text" },
        { field: "tint", label: "Tint" },
        { field: "divider", label: "Divider" },
    ],
    "Interactive Elements": [
        { field: "buttonBg", label: "Button Background" },
        { field: "buttonText", label: "Button Text" },
        { field: "iconOrTextButton", label: "Icon/Text Button" },
    ],
    "Text Hierarchy": [
        { field: "subtleText", label: "Subtle Text" },
        { field: "verySubtleText", label: "Very Subtle Text" },
    ],
    "Icons": [
        { field: "iconPrimary", label: "Primary Icon" },
        { field: "iconSecondary", label: "Secondary Icon" },
    ],
    "Actions": [
        { field: "upvote", label: "Upvote" },
        { field: "downvote", label: "Downvote" },
        { field: "delete", label: "Delete" },
        { field: "showHide", label: "Show/Hide" },
        { field: "reply", label: "Reply" },
        { field: "bookmark", label: "Bookmark" },
        { field: "moderator", label: "Moderator" },
    ],
};

const COLOR_SWATCHES = {
    "Primary": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
    "UI Colors": ["#007AFF", "#34C759", "#FF9500", "#FF2D55", "#5856D6", "#FF3B30"],
    "Grays": ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF"],
    "Pastels": ["#FFB4B4", "#A5FFD6", "#B4E4FF", "#FFD6A5", "#D6A5FF", "#A5FFE4"],
};

export default function ThemeMaker() {
    const { theme } = useContext(ThemeContext);
    const navigation = useNavigation();
    const [themeData, setThemeData] = useState<ThemeData>({ ...DEFAULT_THEME } as ThemeData);
    const [selectedColorField, setSelectedColorField] = useState<keyof Theme>("background");
    const [hexInput, setHexInput] = useState<string>(themeData[selectedColorField] as string);
    const [selectedColorGroup, setSelectedColorGroup] = useState<string>("Core Colors");
    const [showPreview, setShowPreview] = useState<boolean>(true);

    const handleColorChange = (color: string) => {
        setHexInput(color);
        setThemeData((prev) => ({ ...prev, [selectedColorField]: color }));
    };

    const handleSelectColorField = (field: keyof Theme) => {
        setSelectedColorField(field);
        setHexInput(themeData[field] as string);
    };

    const validateAndSetHex = (hex: string) => {
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }
        if (/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
            handleColorChange(hex);
        } else {
            setHexInput(hex);
        }
    };

    const saveTheme = () => {
        if (!themeData.name.trim()) {
            Alert.alert("Error", "Please enter a theme name");
            return;
        }
        saveCustomTheme(themeData);
        Alert.alert("Success", "Theme saved successfully!", [
            {
                text: "OK",
                onPress: () => navigation.goBack()
            }
        ]);
    };

    const resetToDefault = () => {
        setThemeData({ ...DEFAULT_THEME, name: "" } as ThemeData);
        setSelectedColorField("background");
        setHexInput(DEFAULT_THEME.background as string);
    };

    const renderPreview = () => (
        <View style={[styles.previewContainer, { backgroundColor: themeData.background as string }]}>
            <View style={styles.previewHeader}>
                <Text style={[styles.previewTitle, { color: themeData.text as string }]}>Preview</Text>
                <TouchableOpacity onPress={() => setShowPreview(!showPreview)}>
                    <Feather
                        name={showPreview ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={themeData.text as string}
                    />
                </TouchableOpacity>
            </View>
            {showPreview && (
                <View style={styles.previewContent}>
                    <Text style={[styles.previewText, { color: themeData.text as string }]}>Sample Text</Text>
                    <Text style={[styles.previewText, { color: themeData.subtleText as string }]}>Subtle Text</Text>
                    <View style={[styles.previewButton, { backgroundColor: themeData.buttonBg as string }]}>
                        <Text style={{ color: themeData.buttonText as string }}>Button</Text>
                    </View>
                    <View style={styles.previewIcons}>
                        <AntDesign name="arrowup" size={24} color={themeData.upvote as string} />
                        <AntDesign name="arrowdown" size={24} color={themeData.downvote as string} />
                        <Octicons name="reply" size={24} color={themeData.reply as string} />
                        <FontAwesome name="bookmark" size={24} color={themeData.bookmark as string} />
                    </View>
                    <View style={[styles.previewInput, { borderColor: themeData.divider as string }]}>
                        <TextInput
                            placeholder="Very Subtle Text"
                            placeholderTextColor={themeData.verySubtleText as string}
                            style={{ color: themeData.text as string }}
                            editable={false}
                        />
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Create Theme</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
                        <Feather name="refresh-cw" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={saveTheme}>
                        <Feather name="check" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.mainContent}>
                {renderPreview()}

                <View style={styles.editorSection}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.text }]}>Theme Name</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.divider }]}
                            value={themeData.name}
                            onChangeText={(text) => setThemeData((prev) => ({ ...prev, name: text }))}
                            placeholder="Enter theme name"
                            placeholderTextColor={theme.subtleText}
                        />
                    </View>

                    <View style={styles.modeContainer}>
                        <View style={styles.modeSection}>
                            <Text style={[styles.label, { color: theme.text }]}>System Mode</Text>
                            <View style={styles.modeButtons}>
                                {['light', 'dark'].map((mode) => (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[
                                            styles.modeButton,
                                            { backgroundColor: themeData.systemModeStyle === mode ? theme.iconOrTextButton : theme.tint }
                                        ]}
                                        onPress={() => setThemeData((prev) => ({ ...prev, systemModeStyle: mode }))}
                                    >
                                        <Text style={{ color: themeData.systemModeStyle === mode ? '#fff' : theme.text }}>
                                            {mode}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.modeSection}>
                            <Text style={[styles.label, { color: theme.text }]}>Status Bar</Text>
                            <View style={styles.modeButtons}>
                                {['light', 'dark'].map((bar) => (
                                    <TouchableOpacity
                                        key={bar}
                                        style={[
                                            styles.modeButton,
                                            { backgroundColor: themeData.statusBar === bar ? theme.iconOrTextButton : theme.tint }
                                        ]}
                                        onPress={() => setThemeData((prev) => ({ ...prev, statusBar: bar }))}
                                    >
                                        <Text style={{ color: themeData.statusBar === bar ? '#fff' : theme.text }}>
                                            {bar}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.colorGroupsContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.colorGroupsScroll}
                            contentContainerStyle={styles.colorGroupsScrollContent}
                        >
                            {Object.keys(COLOR_GROUPS).map((group) => (
                                <TouchableOpacity
                                    key={group}
                                    style={[
                                        styles.colorGroupButton,
                                        { backgroundColor: selectedColorGroup === group ? theme.iconOrTextButton : theme.tint }
                                    ]}
                                    onPress={() => setSelectedColorGroup(group)}
                                >
                                    <Text style={{ color: selectedColorGroup === group ? '#fff' : theme.text }}>
                                        {group}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.colorFieldsContainer}>
                        {COLOR_GROUPS[selectedColorGroup].map(({ field, label }) => (
                            <TouchableOpacity
                                key={field}
                                style={[
                                    styles.colorFieldButton,
                                    { borderColor: selectedColorField === field ? theme.iconOrTextButton : theme.divider }
                                ]}
                                onPress={() => handleSelectColorField(field)}
                            >
                                <Text style={{ color: theme.text }}>{label}</Text>
                                <View style={[
                                    styles.colorPreview,
                                    { backgroundColor: themeData[field] as string, borderColor: theme.divider }
                                ]} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.colorPickerContainer}>
                        <Text style={[styles.label, { color: theme.text }]}>
                            Pick a color for {COLOR_GROUPS[selectedColorGroup].find(c => c.field === selectedColorField)?.label}
                        </Text>
                        <View style={styles.hexInputContainer}>
                            <TextInput
                                style={[styles.hexInput, { color: theme.text, borderColor: theme.divider }]}
                                value={hexInput}
                                onChangeText={validateAndSetHex}
                                placeholder="#RRGGBB"
                                placeholderTextColor={theme.subtleText}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                style={styles.resetColorButton}
                                onPress={() => handleColorChange(DEFAULT_THEME[selectedColorField] as string)}
                            >
                                <Text style={{ color: theme.iconOrTextButton }}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                        {Object.entries(COLOR_SWATCHES).map(([group, colors]) => (
                            <View key={group} style={styles.swatchGroup}>
                                <Text style={[styles.swatchGroupLabel, { color: theme.text }]}>{group}</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.swatchGroupContent}
                                >
                                    {colors.map((color, idx) => (
                                        <TouchableOpacity
                                            key={color + '-' + idx}
                                            style={[
                                                styles.swatch,
                                                { backgroundColor: color, borderColor: hexInput === color ? theme.iconOrTextButton : theme.divider }
                                            ]}
                                            onPress={() => validateAndSetHex(color)}
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    headerButtons: {
        flexDirection: "row",
        gap: 12,
    },
    resetButton: {
        padding: 8,
    },
    saveButton: {
        padding: 8,
    },
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
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    modeContainer: {
        marginBottom: 24,
    },
    modeSection: {
        marginBottom: 16,
    },
    modeButtons: {
        flexDirection: "row",
        gap: 8,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    colorGroupsContainer: {
        marginBottom: 16,
    },
    colorGroupsScroll: {
        flexDirection: "row",
    },
    colorGroupsScrollContent: {
        paddingHorizontal: 8,
    },
    colorGroupButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    colorFieldsContainer: {
        marginBottom: 16,
    },
    colorFieldButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
    colorPreview: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
    },
    colorPickerContainer: {
        marginTop: 16,
    },
    hexInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    hexInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginRight: 8,
    },
    resetColorButton: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
    },
    swatchGroup: {
        marginBottom: 16,
    },
    swatchGroupLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    swatchGroupContent: {
        paddingHorizontal: 8,
    },
    swatch: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: 4,
    },
    previewContainer: {
        margin: 16,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    previewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    previewContent: {
        padding: 16,
        gap: 16,
    },
    previewText: {
        fontSize: 16,
    },
    previewButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    previewIcons: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 16,
    },
    previewInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
    },
});
