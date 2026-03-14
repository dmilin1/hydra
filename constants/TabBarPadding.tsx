export const TAB_BAR_REMOVED_PADDING_BOTTOM = 15;

export const getEffectiveTabBarRemovedPaddingBottom = (
  bottomInset: number,
) => {
  return bottomInset > 0 ? 0 : TAB_BAR_REMOVED_PADDING_BOTTOM;
};
