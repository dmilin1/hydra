import React, { useContext } from "react";

import { HistoryContext } from "../../../../contexts/HistoryContext";
import DirectionButton from "../Components/DirectionButton";
import SortAndContext from "../Components/SortAndContext";
import TextButton from "../Components/TextButton";

export default function Home() {
  const history = useContext(HistoryContext);

  return (
    <>
      <DirectionButton direction="backward" />
      <TextButton text={history.past.slice(-1)[0]?.name} />
      <SortAndContext
        sortOptions={["Best", "Hot", "New", "Top", "Rising"]}
        contextOptions={["Share"]}
      />
    </>
  );
}
