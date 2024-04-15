import React, { useContext } from "react";

import { HistoryContext } from "../../../../contexts/HistoryContext";
import DirectionButton from "../Components/DirectionButton";
import TextButton from "../Components/TextButton";

export default function Default() {
  const history = useContext(HistoryContext);

  return (
    <>
      <DirectionButton direction="backward" />
      <TextButton text={history.past.slice(-1)[0]?.name} />
      <DirectionButton direction="forward" />
    </>
  );
}
