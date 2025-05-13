import React, { useContext } from "react";
import { StyleSheet, View, Dimensions, TextInput } from "react-native";

import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

type SelectTextProps = {
  text: string;
};

export default function SelectText({ text }: SelectTextProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  return (
    <>
      <View
        style={t(styles.selectTextContainer, {
          backgroundColor: theme.tint,
          borderColor: theme.divider,
        })}
      >
        <TextInput
          style={t(styles.text, {
            color: theme.text,
          })}
          value={text}
          editable={false}
          multiline
        />
      </View>
      <View
        style={styles.background}
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
    bottom: -Dimensions.get("window").height,
    left: -3,
    width: Dimensions.get("window").width + 6,
    height: Dimensions.get("window").height * 0.65,
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
    height: Dimensions.get("window").height,
    backgroundColor: "black",
    opacity: 0.7,
  },
});
