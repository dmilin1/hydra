import React, { useContext, useState, useEffect } from "react";
import {
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Text,
  ColorValue,
  Keyboard,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Slider from "./Slider";
import TextInput from "../TextInput";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { hexToRgb, rgbToHex, validateHex } from "../../../utils/colors";

type ColorPickerProps = {
  show: boolean;
  onClose: () => void;
  currentColor: ColorValue;
  onChange: (color: ColorValue) => void;
};

export default function ColorPicker({
  show,
  onClose,
  currentColor,
  onChange,
}: ColorPickerProps) {
  const { baseTheme } = useContext(ThemeContext);
  const [rgb, setRgb] = useState(hexToRgb(currentColor));
  const [hexInput, setHexInput] = useState(currentColor);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const previewColor = rgbToHex(rgb.r, rgb.g, rgb.b);

  useEffect(() => {
    const newRgb = hexToRgb(currentColor);
    setRgb(newRgb);
    setHexInput(currentColor);
  }, [currentColor]);

  const handleRgbChange = (channel: "r" | "g" | "b", value: number) => {
    const newRgb = { ...rgb, [channel]: Math.round(value) };
    setRgb(newRgb);
    setHexInput(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleRgbComplete = (channel: "r" | "g" | "b", value: number) => {
    const newRgb = { ...rgb, [channel]: Math.round(value) };
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    onChange(hex);
  };

  const handleHexInputChange = (text: string) => {
    setHexInput(text);

    const hexToValidate = text.startsWith("#") ? text : "#" + text;

    if (validateHex(hexToValidate)) {
      const newRgb = hexToRgb(hexToValidate);
      setRgb(newRgb);
      onChange(hexToValidate);
    }
  };

  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", () => {
      setKeyboardVisible(true);
    });
    Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardVisible(false);
    });
  }, []);

  return (
    <Modal visible={show} animationType="fade" transparent={true}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.overlay, { flex: keyboardVisible ? 0 : 1 }]} />
        </TouchableWithoutFeedback>

        <View
          style={[styles.modalContent, { backgroundColor: baseTheme.tint }]}
        >
          <View
            style={[styles.header, { borderBottomColor: baseTheme.divider }]}
          >
            <Text style={[styles.title, { color: baseTheme.text }]}>
              Color Picker
            </Text>
            <TouchableWithoutFeedback onPress={onClose}>
              <Text
                style={[
                  styles.closeButton,
                  {
                    color: baseTheme.iconOrTextButton,
                  },
                ]}
              >
                Done
              </Text>
            </TouchableWithoutFeedback>
          </View>

          <View style={styles.previewContainer}>
            <View
              style={[
                styles.colorPreview,
                {
                  backgroundColor: previewColor,
                  borderColor: baseTheme.text,
                },
              ]}
            />
            <View style={styles.hexInputContainer}>
              <Text style={[styles.hexLabel, { color: baseTheme.subtleText }]}>
                HEX:
              </Text>
              <TextInput
                style={[
                  styles.hexInput,
                  {
                    color: baseTheme.text,
                    borderColor: baseTheme.divider,
                    backgroundColor: baseTheme.background,
                  },
                ]}
                value={hexInput.toString()}
                onChangeText={handleHexInputChange}
                placeholder="#000000"
                placeholderTextColor={baseTheme.verySubtleText}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={7}
              />
            </View>
          </View>

          <View style={styles.slidersContainer}>
            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLabel, { color: baseTheme.text }]}>
                R
              </Text>
              <View style={styles.sliderWrapper}>
                <Slider
                  value={rgb.r}
                  minimumValue={0}
                  maximumValue={255}
                  onValueChange={(value) => handleRgbChange("r", value)}
                  onSlidingComplete={(value) => handleRgbComplete("r", value)}
                  minimumTrackTintColor="#FF0000"
                  maximumTrackTintColor={baseTheme.divider}
                  thumbTintColor={baseTheme.buttonBg}
                  style={styles.slider}
                />
              </View>
            </View>

            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLabel, { color: baseTheme.text }]}>
                G
              </Text>
              <View style={styles.sliderWrapper}>
                <Slider
                  value={rgb.g}
                  minimumValue={0}
                  maximumValue={255}
                  onValueChange={(value) => handleRgbChange("g", value)}
                  onSlidingComplete={(value) => handleRgbComplete("g", value)}
                  minimumTrackTintColor="#00FF00"
                  maximumTrackTintColor={baseTheme.divider}
                  thumbTintColor={baseTheme.buttonBg}
                  style={styles.slider}
                />
              </View>
            </View>

            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLabel, { color: baseTheme.text }]}>
                B
              </Text>
              <View style={styles.sliderWrapper}>
                <Slider
                  value={rgb.b}
                  minimumValue={0}
                  maximumValue={255}
                  onValueChange={(value) => handleRgbChange("b", value)}
                  onSlidingComplete={(value) => handleRgbComplete("b", value)}
                  minimumTrackTintColor="#0000FF"
                  maximumTrackTintColor={baseTheme.divider}
                  thumbTintColor={baseTheme.buttonBg}
                  style={styles.slider}
                />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 16,
    fontWeight: "500",
  },
  previewContainer: {
    padding: 20,
    alignItems: "center",
  },
  colorPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 3,
  },
  hexInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  hexLabel: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: "500",
  },
  hexInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    width: 100,
    fontFamily: "monospace",
  },
  slidersContainer: {
    paddingHorizontal: 20,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "600",
    width: 25,
  },
  sliderWrapper: {
    flex: 1,
    marginLeft: 15,
  },
  slider: {
    height: 40,
  },
});
