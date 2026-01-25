import { createContext, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  ScrollView,
  ScrollViewProps,
  TextInput,
  useWindowDimensions,
} from "react-native";

type KeyboardAvoidingScrollerProps = ScrollViewProps;

type KeyboardAvoidingScrollerContextType = {
  scrollViewRef: React.RefObject<ScrollView | null>;
  currentInput: TextInput | null;
  setCurrentInput: (input: TextInput) => void;
};

const measureAsync = (elem: any) => {
  return new Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  }>((resolve) => {
    elem.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number,
      ) => {
        resolve({ x, y, width, height, pageX, pageY });
      },
    );
  });
};

export const KeyboardAvoidingScrollerContext =
  createContext<KeyboardAvoidingScrollerContextType>({
    scrollViewRef: { current: null },
    currentInput: null,
    setCurrentInput: () => {},
  });

const SCROLL_OFFSET = 100;

export default function KeyboardAvoidingScroller(
  props: KeyboardAvoidingScrollerProps,
) {
  const { height } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView>(null);
  const [currentInput, setCurrentInput] = useState<TextInput | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const focusInput = async () => {
    if (!currentInput || !keyboardHeight) return;
    const { height: textInputHeight, y: textInputY } =
      await measureAsync(currentInput);
    const { pageY: scrollPageY } = await measureAsync(scrollViewRef.current);

    scrollViewRef.current?.scrollTo({
      y:
        textInputY +
        (keyboardHeight - height) +
        scrollPageY +
        textInputHeight +
        SCROLL_OFFSET,
      animated: true,
    });
  };

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardWillShow", async (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setCurrentInput(null);
    });
    const hideListener = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    focusInput();
  }, [currentInput, keyboardHeight]);

  return (
    <KeyboardAvoidingScrollerContext.Provider
      value={{
        scrollViewRef,
        currentInput,
        setCurrentInput,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        automaticallyAdjustKeyboardInsets
        {...props}
      />
    </KeyboardAvoidingScrollerContext.Provider>
  );
}
