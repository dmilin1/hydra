import { Entypo } from "@expo/vector-icons";
import React, { useContext } from "react";

import { HistoryContext } from "../../../../contexts/HistoryContext";
import { ModalContext } from "../../../../contexts/ModalContext";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";
import Login from "../../../Modals/Login";
import DirectionButton from "../Components/DirectionButton";
import IconButton from "../Components/IconButton";
import TextButton from "../Components/TextButton";

export default function Accounts() {
  const history = useContext(HistoryContext);
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  return (
    <>
      <DirectionButton direction="backward" />
      <TextButton text={history.past.slice(-1)[0]?.name} />
      <IconButton
        icon={<Entypo name="plus" size={24} color={theme.buttonText} />}
        onPress={() => setModal(<Login />)}
        justifyContent="flex-end"
      />
    </>
  );
}
