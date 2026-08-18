import { describe, expect, test } from "bun:test";

import GallerySeenTracker, {
  type GalleryViewabilityChange,
} from "../components/UI/Gallery/gallerySeenTracker";

const change = (
  postId: string,
  mediaIndex: number,
  mediaCount: number,
  isViewable: boolean,
): GalleryViewabilityChange => ({
  item: { postId, mediaIndex, mediaCount },
  isViewable,
});

describe("GallerySeenTracker", () => {
  test("marks a single-media post after it leaves view while scrolling forward", () => {
    const tracker = new GallerySeenTracker();

    expect(tracker.update([change("a", 0, 1, true)], true)).toEqual([]);
    expect(tracker.update([change("a", 0, 1, false)], true)).toEqual(["a"]);
  });

  test("waits until every media tile in an album has been viewed and left view", () => {
    const tracker = new GallerySeenTracker();

    tracker.update([change("album", 0, 3, true)], true);
    expect(tracker.update([change("album", 0, 3, false)], true)).toEqual([]);

    tracker.update(
      [change("album", 1, 3, true), change("album", 2, 3, true)],
      true,
    );
    expect(tracker.update([change("album", 1, 3, false)], true)).toEqual([]);
    expect(tracker.update([change("album", 2, 3, false)], true)).toEqual([
      "album",
    ]);
  });

  test("handles one album tile leaving as another becomes visible", () => {
    const tracker = new GallerySeenTracker();

    tracker.update([change("album", 0, 2, true)], true);
    expect(
      tracker.update(
        [change("album", 0, 2, false), change("album", 1, 2, true)],
        true,
      ),
    ).toEqual([]);
    expect(tracker.update([change("album", 1, 2, false)], true)).toEqual([
      "album",
    ]);
  });

  test("does not mark a post whose remaining album tiles were never visible", () => {
    const tracker = new GallerySeenTracker();

    tracker.update([change("album", 0, 2, true)], true);
    expect(tracker.update([change("album", 0, 2, false)], true)).toEqual([]);
  });

  test("does not mark when a post leaves view while scrolling backward", () => {
    const tracker = new GallerySeenTracker();

    tracker.update([change("a", 0, 1, true)], false);
    expect(tracker.update([change("a", 0, 1, false)], false)).toEqual([]);

    tracker.update([change("a", 0, 1, true)], true);
    expect(tracker.update([change("a", 0, 1, false)], true)).toEqual(["a"]);
  });

  test("marks a post at most once despite repeated viewability callbacks", () => {
    const tracker = new GallerySeenTracker();

    tracker.update([change("a", 0, 1, true), change("a", 0, 1, true)], true);
    expect(tracker.update([change("a", 0, 1, false)], true)).toEqual(["a"]);

    tracker.update([change("a", 0, 1, true)], true);
    expect(tracker.update([change("a", 0, 1, false)], true)).toEqual([]);
  });

  test("handles multiple posts becoming scrolled past in one update", () => {
    const tracker = new GallerySeenTracker();

    tracker.update([change("a", 0, 1, true), change("b", 0, 1, true)], true);
    expect(
      tracker.update(
        [change("a", 0, 1, false), change("b", 0, 1, false)],
        true,
      ),
    ).toEqual(["a", "b"]);
  });
});
