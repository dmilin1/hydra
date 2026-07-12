import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import SelectableText from "../UI/SelectableText";
import { Touchable } from "react-native-gesture-handler";

type SelectTextProps = {
  text: string;
};

export default function SelectText({ text }: SelectTextProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  return (
    <>
      <View
        style={[
          styles.selectTextContainer,
          {
            backgroundColor: theme.tint,
            borderColor: theme.divider,
          },
        ]}
      >
        <SelectableText
          text={text}
          style={[
            styles.text,
            {
              color: theme.text,
            },
          ]}
        />
      </View>
      <Touchable
        style={styles.background}
        defaultOpacity={0.7}
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
    bottom: 0,
    left: -3,
    right: -3,
    height: "65%",
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
    top: "-100%",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
});
