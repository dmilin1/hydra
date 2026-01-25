import React, { useContext } from "react";
import { StyleSheet, View, TextInput, useWindowDimensions } from "react-native";

import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type SelectTextProps = {
  text: string;
};

export default function SelectText({ text }: SelectTextProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  const { width, height } = useWindowDimensions();

  return (
    <>
      <View
        style={[
          styles.selectTextContainer,
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
        <TextInput
          style={[
            styles.text,
            {
              color: theme.text,
            },
          ]}
          value={text}
          editable={false}
          multiline
        />
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
  selectTextContainer: {
    position: "absolute",
    zIndex: 1,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 3,
  },
  text: {
    flex: 1,
    fontSize: 16,
    paddingBottom: 60,
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
