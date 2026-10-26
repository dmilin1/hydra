/* global HydraLinks, HYDRA_LINK_HOST */
(() => {
  const isFallbackReferral = () => {
    try {
      const referrer = new URL(document.referrer);
      return (
        referrer.protocol === "https:" && referrer.host === HYDRA_LINK_HOST
      );
    } catch {
      return false;
    }
  };
  // The fallback sends its origin as the referrer; navigation arriving from
  // it should continue in Safari instead of being rewritten back.
  if (isFallbackReferral()) return;
  // Preserve the fallback page's explicit Continue on Reddit link.
  if (location.hostname === HYDRA_LINK_HOST) return;
  const rewrite = (anchor) => {
    const target = HydraLinks.openLink(anchor.href, HYDRA_LINK_HOST);
    if (target) anchor.href = target;
  };
  const scan = (node) => {
    if (!(node instanceof Element)) return;
    if (node.matches("a[href]")) rewrite(node);
    node.querySelectorAll("a[href]").forEach(rewrite);
  };
  // Rewrite actual anchors so Safari handles the user's trusted tap normally.
  // Do not cancel the event or replace target-related attributes.
  document.addEventListener(
    "click",
    (event) => {
      const anchor = event
        .composedPath()
        .find((node) => node instanceof HTMLAnchorElement);
      if (anchor) rewrite(anchor);
    },
    true,
  );
  new MutationObserver((records) => {
    const roots = new Set();
    for (const record of records) {
      if (record.type === "attributes") {
        if (record.target instanceof HTMLAnchorElement)
          roots.add(record.target);
      } else {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) roots.add(node);
        });
      }
    }
    for (const root of roots) {
      let parent = root.parentElement;
      while (parent && !roots.has(parent)) parent = parent.parentElement;
      if (!parent) scan(root);
    }
  }).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"],
  });
  if (document.documentElement) scan(document.documentElement);
  // Direct Reddit visits use script navigation; Safari may keep these
  // universal links in the browser instead of opening the app.
  const current = HydraLinks.openLink(location.href, HYDRA_LINK_HOST);
  if (current) location.replace(current);
})();
