/**
 * Paging for GraphQL lists, which return an opaque endCursor, while
 * useRedditDataState asks for the page after the last loaded item's `after`.
 */

/** Cursors Reddit returned for the next page, by list and last item. */
const nextCursors = new Map<string, string>();

type ListPage<T> = {
  items: T[];
  endCursor?: string | null;
  hasNextPage?: boolean;
};

// Pages to skip ahead through when every item on a page was dropped.
const MAX_EMPTY_PAGES = 5;

/**
 * Loads the page of a list (named by `listKey`) after the item whose `after`
 * is `after`. Reddit drops removed posts and deleted comments when fetching
 * the full items, so a page can come back empty while the list goes on. Those
 * pages are skipped, since an empty page means the end of the list to
 * useRedditDataState.
 */
export async function loadPage<T extends { after: string }>(
  listKey: string,
  after: string | undefined,
  fetchPage: (cursor?: string) => Promise<ListPage<T>>,
): Promise<T[]> {
  let cursor: string | undefined;
  if (after) {
    // None remembered: Reddit said the list ended there.
    cursor = nextCursors.get(`${listKey}|${after}`);
    if (!cursor) return [];
  }
  for (let i = 0; i < MAX_EMPTY_PAGES; i++) {
    const page = await fetchPage(cursor);
    const hasMore = !!page.endCursor && page.hasNextPage !== false;
    if (page.items.length || !hasMore) {
      const last = page.items[page.items.length - 1]?.after;
      if (last && page.endCursor && hasMore) {
        nextCursors.set(`${listKey}|${last}`, page.endCursor);
      }
      return page.items;
    }
    cursor = page.endCursor ?? undefined;
  }
  return [];
}
