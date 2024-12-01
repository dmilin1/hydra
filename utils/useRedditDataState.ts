import { useState } from "react";

import { RedditDataObject } from "../api/RedditApi";

export default function useRedditDataState<T extends RedditDataObject>() {
  const [data, setData] = useState<T[]>([]);
  const [fullyLoaded, setFullyLoaded] = useState(false);

  const addData = (newData: T[]) => {
    const newItems = newData.filter(
      (newItem) =>
        !data.find(
          (datum) => datum.id === newItem.id && datum.type === newItem.type,
        ),
    );
    setData([...data, ...newItems]);
    if (newData.length === 0) {
      setFullyLoaded(true);
    }
    return newItems.length;
  };

  const modifyData = (modifiedData: T[]) => {
    setData((data) => {
      const newData = [...data];
      modifiedData.forEach((newItem) => {
        const index = newData.findIndex(
          (datum) => datum.id === newItem.id && datum.type === newItem.type,
        );
        if (index !== -1) {
          newData[index] = newItem;
        }
      });
      return newData;
    });
  };

  const deleteData = (deletedData: T[]) => {
    setData((data) => {
      return data.filter(
        (datum) =>
          !deletedData.find(
            (deletedDatum) =>
              deletedDatum.id === datum.id && deletedDatum.type === datum.type,
          ),
      );
    });
  };

  return {
    data,
    setData,
    addData,
    modifyData,
    deleteData,
    fullyLoaded,
  };
}
