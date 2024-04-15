import React, { useContext } from "react";

import { HistoryContext } from "../../../../contexts/HistoryContext";
import URL from "../../../../utils/URL";
import DirectionButton from "../Components/DirectionButton";
import SortAndContext from "../Components/SortAndContext";
import TextButton from "../Components/TextButton";

export default function User() {
  const history = useContext(HistoryContext);

  const path = history.past.slice(-1)[0].elem.props.url;
  const section = new URL(path).getRelativePath().split("/")[3];

  return (
    <>
      {history.past.length === 1 ? (
        <TextButton
          text="Accounts"
          justifyContent="flex-start"
          onPress={() => history.pushPath("hydra://accounts")}
        />
      ) : (
        <DirectionButton direction="backward" />
      )}
      <TextButton text={history.past.slice(-1)[0]?.name} />
      <SortAndContext
        sortOptions={
          section === "submitted" || section === "comments"
            ? ["New", "Hot", "Top"]
            : undefined
        }
        contextOptions={["Share"]}
      />
    </>
  );
}
