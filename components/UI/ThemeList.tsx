import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import Slideable from "./Slideable";
import ThemeRow from "./ThemeRow";
import KeyStore from "../../utils/KeyStore";
import Themes, { Theme } from "../../constants/Themes";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type ThemeListProps = {
    currentThemeKey?: string;
    onSelect: (key: string, theme: Theme, isCustom: boolean) => void;
};

export default function ThemeList({
    currentThemeKey,
    onSelect,
}: ThemeListProps) {
    const { theme } = useContext(ThemeContext);
    const [customThemes, setCustomThemes] = useState<Record<string, Theme>>({});
    const isFocused = useIsFocused();

    useEffect(() => {
        const raw = KeyStore.getString("customThemes");
        if (raw) {
            try {
                setCustomThemes(JSON.parse(raw));
            } catch {
                console.warn("Failed to parse customThemes");
                setCustomThemes({});
            }
        } else {
            setCustomThemes({});
        }
    }, [isFocused]);

    const handleDelete = (key: string) => {
        Alert.alert(
            "Delete Theme",
            `Are you sure you want to delete "${key}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        const next = { ...customThemes };
                        delete next[key];
                        KeyStore.set("customThemes", JSON.stringify(next));
                        setCustomThemes(next);
                    },
                },
            ],
        );
    };

    return (
        <View>
            {Object.keys(customThemes).length > 0 && (
                <>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Custom Themes
                    </Text>
                    {Object.entries(customThemes).map(([key, themeData]) => (
                        <Slideable
                            key={key}
                            right={[
                                {
                                    icon: <Feather name="trash-2" size={24} color={theme.text} />,
                                    color: theme.downvote,
                                    action: () => handleDelete(key),
                                },
                            ]}
                        >
                            <ThemeRow
                                theme={themeData}
                                isSelected={currentThemeKey === key}
                                onPress={() => onSelect(key, themeData, true)}
                            />
                        </Slideable>
                    ))}
                </>
            )}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Built-in Themes
            </Text>
            {Object.entries(Themes).map(([key, themeData]) => (
                <ThemeRow
                    key={key}
                    theme={themeData}
                    isSelected={currentThemeKey === key}
                    onPress={() => onSelect(key, themeData, false)}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
});
