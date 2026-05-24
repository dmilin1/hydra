import { Platform, TextInput, Text, StyleProp, TextStyle } from "react-native";

type SelectableTextProps = {
  text: string;
  style: StyleProp<TextStyle>;
};

export default function SelectableText({ text, style }: SelectableTextProps) {
  /**
   * Need to handle this differently for iOS and Android.
   * https://github.com/react-native-community/discussions-and-proposals/issues/908
   */
  return Platform.OS === "ios" ? (
    <TextInput
      style={style}
      value={text}
      readOnly={true}
      textAlignVertical="top"
      multiline
      selectTextOnFocus
    />
  ) : (
    <Text style={style} selectable={true}>
      {text}
    </Text>
  );
}
