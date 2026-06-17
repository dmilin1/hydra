import React, { useContext } from "react";
import { StyleSheet, View, Text, ScrollView, useWindowDimensions, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type TranslationModalProps = {
  originalText: string;
  translatedText: string;
};

export default function TranslationModal({ originalText, translatedText }: TranslationModalProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  const { width, height } = useWindowDimensions();

  return (
    <>
      <View
        style={[
          styles.translationContainer,
          {
            backgroundColor: theme.tint,
            borderColor: theme.divider,
            bottom: -height,
            left: -3,
            width: width + 6,
            height: height * 0.65,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Translation</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModal(null)}
          >
            <MaterialCommunityIcons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>Original</Text>
          <ScrollView style={styles.textScroll}>
            <Text style={[styles.text, { color: theme.text }]}>{originalText}</Text>
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>Translated</Text>
          <ScrollView style={styles.textScroll}>
            <Text style={[styles.text, { color: theme.text }]}>{translatedText}</Text>
          </ScrollView>
        </View>
      </View>
      <View
        style={[styles.background, { height }]}
        onTouchStart={() => {
          setModal(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  translationContainer: {
    position: "absolute",
    zIndex: 1,
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  section: {
    flex: 1,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  textScroll: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  background: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    backgroundColor: "black",
    opacity: 0.7,
  },
});
