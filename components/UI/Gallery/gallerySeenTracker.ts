export type GalleryViewabilityItem = {
  postId: string;
  mediaIndex: number;
  mediaCount: number;
};

export type GalleryViewabilityChange = {
  item: GalleryViewabilityItem;
  isViewable: boolean;
};

/**
 * Tracks gallery media visibility per post without relying on list indices.
 * Masonry layout may rearrange tiles, so a post is only considered scrolled
 * past after every one of its media tiles has been viewable and none remain
 * visible while the user is moving forward through the feed.
 */
export default class GallerySeenTracker {
  private readonly viewedMediaByPost = new Map<string, Set<number>>();
  private readonly visibleMediaByPost = new Map<string, Set<number>>();
  private readonly markedPostIds = new Set<string>();

  update(
    changes: GalleryViewabilityChange[],
    scrollingForward: boolean,
  ): string[] {
    const candidatePostIds = new Set<string>();
    const mediaCountByPost = new Map<string, number>();

    for (const { item, isViewable } of changes) {
      mediaCountByPost.set(item.postId, item.mediaCount);

      if (isViewable) {
        this.addMedia(this.viewedMediaByPost, item.postId, item.mediaIndex);
        this.addMedia(this.visibleMediaByPost, item.postId, item.mediaIndex);
      } else {
        this.removeMedia(this.visibleMediaByPost, item.postId, item.mediaIndex);
        candidatePostIds.add(item.postId);
      }
    }

    if (!scrollingForward) return [];

    const newlySeenPostIds: string[] = [];
    for (const postId of candidatePostIds) {
      if (this.markedPostIds.has(postId)) continue;

      const mediaCount = mediaCountByPost.get(postId);
      if (mediaCount === undefined) continue;

      const viewedMediaCount = this.viewedMediaByPost.get(postId)?.size ?? 0;
      const visibleMediaCount = this.visibleMediaByPost.get(postId)?.size ?? 0;
      if (viewedMediaCount < mediaCount || visibleMediaCount > 0) continue;

      this.markedPostIds.add(postId);
      this.viewedMediaByPost.delete(postId);
      this.visibleMediaByPost.delete(postId);
      newlySeenPostIds.push(postId);
    }

    return newlySeenPostIds;
  }

  private addMedia(
    mediaByPost: Map<string, Set<number>>,
    postId: string,
    mediaIndex: number,
  ) {
    const mediaIndexes = mediaByPost.get(postId) ?? new Set<number>();
    mediaIndexes.add(mediaIndex);
    mediaByPost.set(postId, mediaIndexes);
  }

  private removeMedia(
    mediaByPost: Map<string, Set<number>>,
    postId: string,
    mediaIndex: number,
  ) {
    const mediaIndexes = mediaByPost.get(postId);
    if (!mediaIndexes) return;

    mediaIndexes.delete(mediaIndex);
    if (mediaIndexes.size === 0) {
      mediaByPost.delete(postId);
    }
  }
}
