import { ColorValue } from "react-native";
import {
  CUSTOM_THEME_IMPORT_PREFIX,
  CustomTheme,
  CUSTOM_THEME_IMPORT_REGEX,
} from "../constants/Themes";

export const validateHex = (color: any) => {
  return (
    typeof color === "string" &&
    color.startsWith("#") &&
    RegExp(/^#([0-9A-F]{3})|([0-9A-F]{6})|([0-9A-F]{8})$/i).test(color)
  );
};

export const hexToRgb = (
  hex: ColorValue,
): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    hex.toString(),
  );
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

export const rgbToHex = (r: number, g: number, b: number): ColorValue => {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

export const extractThemeFromText = (
  text: string,
): {
  customThemes: CustomTheme[];
  remainingText: string;
} => {
  const segments = text.match(CUSTOM_THEME_IMPORT_REGEX);
  const customThemes: CustomTheme[] = [];
  let remainingText = text;
  if (segments) {
    segments.forEach((segment) => {
      try {
        const customTheme = JSON.parse(
          segment.slice(CUSTOM_THEME_IMPORT_PREFIX.length),
        );
        customThemes.push(customTheme);
        remainingText = remainingText.replace(segment, "");
      } catch (_e) {
        // Failed to parse the custom theme. It might be malformed.
      }
    });
  }
  return {
    customThemes,
    remainingText,
  };
};
