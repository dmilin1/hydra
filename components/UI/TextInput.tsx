import { useContext, useRef } from "react";
import {
  TextInputProps as RNTextInputProps,
  TextInput as RNTextInput,
  TextInputInstance,
} from "react-native";

import { KeyboardAvoidingScrollerContext } from "./KeyboardAvoidingScroller";

type TextInputProps = RNTextInputProps;

export default function TextInput(props: TextInputProps) {
  const textInputRef = useRef<TextInputInstance>(null);
  const { setCurrentInput } = useContext(KeyboardAvoidingScrollerContext);

  return (
    <RNTextInput
      ref={textInputRef}
      onFocus={async (e) => {
        props.onFocus?.(e);
        if (textInputRef.current) {
          setCurrentInput(textInputRef.current);
        }
      }}
      {...props}
    />
  );
}
