import { DependencyList, useContext, useEffect, useRef, useState } from "react";

import { RedditDataObject } from "../api/RedditData";
import {
  BannedSubredditError,
  PrivateSubredditError,
  SubredditDoesNotExistError,
} from "../api/Posts";
import { BannedUserError, UserDoesNotExistError } from "../api/User";
import { NotLoggedInError } from "../api/gql/WebToken";
import { AccountContext } from "../contexts/AccountContext";
import { ToastContext } from "../contexts/ToastContext";

export type FilterFunction<T extends RedditDataObject> = (
  newData: T[],
  data: T[],
) => Promise<T[]> | T[];

type UseRedditDataStateProps<T extends RedditDataObject> = {
  loadData: (after: string | undefined) => Promise<T[]>;
  filterRules?: FilterFunction<T>[];
  /**
   * How many more pages to load when filters remove everything on a page,
   * before giving up with hitFilterLimit. Each one is a request (two for
   * feeds), so keep it low enough to avoid Reddit's rate limits.
   */
  filterRetries?: number;
  refreshDependencies?: DependencyList;
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

export type AccessFailure =
  | BannedSubredditError
  | PrivateSubredditError
  | SubredditDoesNotExistError
  | BannedUserError
  | UserDoesNotExistError
  | NotLoggedInError;

export function isAccessFailure(e: unknown): e is AccessFailure {
  return (
    e instanceof BannedSubredditError ||
    e instanceof PrivateSubredditError ||
    e instanceof SubredditDoesNotExistError ||
    e instanceof BannedUserError ||
    e instanceof UserDoesNotExistError ||
    e instanceof NotLoggedInError
  );
}

type FilteredPage<T> = {
  /** null at the end of the list, [] when the filters removed every page. */
  data: T[] | null;
  cursor: string | undefined;
  accessFailure?: AccessFailure;
};

export default function useRedditDataState<T extends RedditDataObject>({
  loadData,
  filterRules = [],
  filterRetries = 5,
  refreshDependencies = [],
}: UseRedditDataStateProps<T>) {
  const { currentUser } = useContext(AccountContext);
  const { showToast } = useContext(ToastContext);
  const unfilteredAfter = useRef<string | undefined>(undefined);
  // Bumped by every refresh, so loads started before it are dropped instead
  // of landing in the new list (e.g. after a sort change).
  const generation = useRef(0);
  // The scroller asks for more as soon as a list is empty, so without this a
  // load-more would run alongside a refresh or the first page.
  const inFlight = useRef<Promise<void> | null>(null);

  const [data, setData] = useState<T[]>([]);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const [hitFilterLimit, setHitFilterLimit] = useState(false);
  const [accessFailure, setAccessFailure] = useState<AccessFailure | null>(
    null,
  );

  const applyFilters = async (newData: T[], filters: FilterFunction<T>[]) =>
    filters.reduce(
      async (acc, filterRule) => filterRule(await acc, data),
      Promise.resolve(newData),
    );

  const loadFilteredPage = async (
    after: string | undefined,
    filters: FilterFunction<T>[],
  ): Promise<FilteredPage<T>> => {
    let cursor = after;
    for (let i = 0; i < filterRetries; i++) {
      let page: T[];
      try {
        page = await loadData(cursor);
      } catch (e) {
        // Pages without an access failure message (search, inbox) just show
        // nothing.
        if (!isAccessFailure(e)) throw e;
        return { data: null, cursor, accessFailure: e };
      }
      if (page.length === 0) return { data: null, cursor };
      cursor = page.at(-1)?.after;
      const filtered = await applyFilters(page, filters);
      if (filtered.length > 0) return { data: filtered, cursor };
    }
    return { data: [], cursor };
  };

  const showLoadError = (e: unknown) =>
    showToast({
      title: "Couldn't load",
      body: e instanceof Error ? e.message : undefined,
    });

  const track = (load: Promise<void>) => {
    inFlight.current = load;
    load.finally(() => {
      if (inFlight.current === load) inFlight.current = null;
    });
    return load;
  };

  const loadMoreData = () => inFlight.current ?? track(loadNextPage());

  const refreshData = (options: { clearBeforeLoading?: boolean } = {}) =>
    track(refresh(options));

  const loadNextPage = async () => {
    if (hitFilterLimit) return;
    const started = generation.current;
    try {
      const page = await loadFilteredPage(unfilteredAfter.current, [
        filterExisting,
        ...filterRules,
      ]);
      if (started !== generation.current) return;
      unfilteredAfter.current = page.cursor;
      if (page.accessFailure) setAccessFailure(page.accessFailure);
      if (page.data === null) {
        setFullyLoaded(true);
      } else if (page.data.length > 0) {
        const newData = page.data;
        setData((current) => [...current, ...newData]);
      } else {
        setHitFilterLimit(true);
      }
    } catch (e) {
      if (started === generation.current) showLoadError(e);
    }
  };

  const refresh = async ({ clearBeforeLoading = false }) => {
    const started = ++generation.current;
    if (clearBeforeLoading) {
      setData([]);
    }
    setAccessFailure(null);
    setFullyLoaded(false);
    setHitFilterLimit(false);
    try {
      const page = await loadFilteredPage(undefined, filterRules);
      if (started !== generation.current) return;
      unfilteredAfter.current = page.cursor;
      if (page.accessFailure) setAccessFailure(page.accessFailure);
      setHitFilterLimit(page.data?.length === 0);
      setFullyLoaded(page.data === null);
      setData(page.data ?? []);
    } catch (e) {
      if (started === generation.current) showLoadError(e);
    }
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

  const updateData = (
    target: Pick<T, "id" | "type">,
    update: (current: T) => T,
  ) => {
    setData((data) =>
      data.map((item) =>
        item.id === target.id && item.type === target.type
          ? update(item)
          : item,
      ),
    );
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

  const initialLoad = useRef(true);
  useEffect(() => {
    if (initialLoad.current) {
      loadMoreData();
      initialLoad.current = false;
    } else {
      refreshData({ clearBeforeLoading: true });
    }
  }, refreshDependencies);

  /**
   * A page that failed because of the account (logged out, private or banned
   * subreddit) may load for the next one. Pages that loaded keep what they
   * show, so a switch doesn't reload every open page at once.
   */
  const account = currentUser?.userName;
  const lastAccount = useRef(account);
  useEffect(() => {
    if (lastAccount.current === account) return;
    lastAccount.current = account;
    if (accessFailure) {
      refreshData({ clearBeforeLoading: true });
    }
  }, [account]);

  return {
    data,
    loadMoreData,
    refreshData,
    modifyData,
    updateData,
    deleteData,
    fullyLoaded,
    hitFilterLimit,
    accessFailure,
  };
}
