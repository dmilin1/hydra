import { useRef, useState } from "react";

import { RedditDataObject } from "../api/RedditApi";

export type FilterFunction<T extends RedditDataObject> = (
  newData: T[],
  data: T[],
) => Promise<T[]> | T[];

type UseRedditDataStateProps<T extends RedditDataObject> = {
  loadData: (
    after: string | undefined,
    limit: number | undefined,
  ) => Promise<T[]>;
  filterRules?: FilterFunction<T>[];
  filterRetries?: number;
  limitRampUp?: number[];
};

const filterExisting = async <T extends RedditDataObject>(
  newData: T[],
  data: T[],
) => {
  return newData.filter(
    (newItem) =>
      !data.find(
        (datum) => datum.id === newItem.id && datum.type === newItem.type,
      ),
  );
};

export default function useRedditDataState<T extends RedditDataObject>({
  loadData,
  filterRules = [],
  filterRetries = 5,
  limitRampUp,
}: UseRedditDataStateProps<T>) {
  const unfilteredAfter = useRef<string | undefined>(undefined);

  const [data, setData] = useState<T[]>([]);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const [hitFilterLimit, setHitFilterLimit] = useState(false);

  const applyFilters = async (newData: T[], filters: FilterFunction<T>[]) => {
    if (filters.length === 0) return newData;
    return filters.reduce(async (acc, filterRule) => {
      return filterRule(await acc, data);
    }, Promise.resolve(newData));
  };

  const loadMoreData = async () => {
    let newData: T[] = [];
    for (let i = 0; i < filterRetries; i++) {
      const potentialData = await loadData(
        unfilteredAfter.current,
        limitRampUp?.[i],
      );
      if (potentialData.length === 0) {
        setFullyLoaded(true);
        return;
      }
      unfilteredAfter.current = potentialData.slice(-1)[0]?.after;
      newData = await applyFilters(potentialData, [
        filterExisting,
        ...filterRules,
      ]);
      if (newData.length > 0) {
        break;
      }
      setHitFilterLimit(true);
    }
    setData([...data, ...newData]);
  };

  const refreshData = async () => {
    unfilteredAfter.current = undefined;
    let newData: T[] = [];
    for (let i = 0; i < filterRetries; i++) {
      const potentialData = await loadData(
        unfilteredAfter.current,
        limitRampUp?.[i],
      );
      if (potentialData.length === 0) {
        setData([]);
        setFullyLoaded(true);
        return;
      }
      unfilteredAfter.current = potentialData.slice(-1)[0]?.after;
      newData = await applyFilters(potentialData, filterRules);
      if (newData.length > 0) {
        break;
      }
      setHitFilterLimit(true);
    }
    setData(newData);
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

  const deleteData = (deletedData?: T[]) => {
    if (!deletedData) {
      setData([]);
      return;
    }
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
    loadMoreData,
    refreshData,
    modifyData,
    deleteData,
    fullyLoaded,
    hitFilterLimit,
  };
}
