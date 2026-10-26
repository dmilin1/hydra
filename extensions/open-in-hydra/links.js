/* Shared by the app and Safari extension. Keep it free of native and DOM APIs. */
(function (root) {
  const REDDIT_HOME_PATHS = ["/best", "/hot", "/new", "/top", "/rising"];

  // Keep in sync with RedditURL.getPageType; unsupported links stay in Safari.
  function hydraCanOpenRedditPath(path) {
    return (
      path === "/" ||
      REDDIT_HOME_PATHS.some((prefix) => path.startsWith(prefix)) ||
      path.includes("/comments/") ||
      path.startsWith("/r/") ||
      path.startsWith("/message/inbox") ||
      path.startsWith("/chat") ||
      path.startsWith("/u/") ||
      path.startsWith("/user/") ||
      path.startsWith("/search")
    );
  }

  function redditURL(value) {
    try {
      const url = new URL(value);
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.port
      )
        return null;
      const host = url.hostname.toLowerCase();
      const isRedditHost =
        host === "reddit.com" || host.endsWith(".reddit.com");
      const isImageHost = host === "i.redd.it" || host === "preview.redd.it";
      if (!isRedditHost && !isImageHost) return null;
      if (isRedditHost && !hydraCanOpenRedditPath(url.pathname)) return null;
      // Hydra's router expects the canonical Reddit host.
      url.protocol = "https:";
      if (isRedditHost) url.hostname = "www.reddit.com";
      return url.href;
    } catch {
      return null;
    }
  }
  function unwrap(value) {
    try {
      const url = new URL(value);
      if (
        /^(www\.)?google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(url.hostname) &&
        url.pathname === "/url"
      )
        return (
          url.searchParams.get("url") || url.searchParams.get("q") || value
        );
      if (
        url.hostname === "duckduckgo.com" ||
        url.hostname.endsWith(".duckduckgo.com")
      )
        return url.searchParams.get("uddg") || value;
      if (url.hostname === "www.bing.com" || url.hostname === "bing.com")
        return url.searchParams.get("url") || value;
    } catch {
      /* Ignore malformed links. */
    }
    return value;
  }
  function openLink(value, host) {
    const target = redditURL(unwrap(value));
    if (!target) return null;
    return `https://${host}/open?url=${encodeURIComponent(target)}`;
  }
  function incomingLink(value, host) {
    try {
      const url = new URL(value);
      if (
        url.protocol !== "https:" ||
        url.host !== host ||
        url.pathname !== "/open" ||
        url.username ||
        url.password
      )
        return null;
      if (url.searchParams.getAll("url").length !== 1) return null;
      return redditURL(url.searchParams.get("url"));
    } catch {
      return null;
    }
  }
  const api = { redditURL, unwrap, openLink, incomingLink };
  if (typeof module !== "undefined") module.exports = api;
  else root.HydraLinks = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
