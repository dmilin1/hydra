import { describe, expect, test } from "bun:test";
import {
  incomingLink,
  openLink,
  redditURL,
  unwrap,
} from "../extensions/open-in-hydra/links";

const host = "open.example.com";

describe("Open in Hydra links", () => {
  test("round trips post, comment, query and fragment without double decoding", () => {
    const url =
      "https://www.reddit.com/r/test/comments/abc/title/def/?context=3&value=a%26b%2520#comment";
    expect(incomingLink(openLink(url, host)!, host)).toBe(url);
  });
  test("canonicalizes Reddit hosts and preserves image hosts", () => {
    expect(redditURL("http://old.reddit.com/r/test?sort=top")).toBe(
      "https://www.reddit.com/r/test?sort=top",
    );
    expect(redditURL("https://i.redd.it/image.png")).toBe(
      "https://i.redd.it/image.png",
    );
    expect(
      incomingLink(openLink("https://i.redd.it/image.png", host)!, host),
    ).toBe("https://i.redd.it/image.png");
  });
  test("rejects hostile domains, credentials, ports and schemes", () => {
    for (const url of [
      "https://reddit.com.evil.test/r/test",
      "https://evilreddit.com/",
      "https://reddit.com@evil.test/",
      "https://user@reddit.com/",
      "https://reddit.com:8443/",
      "javascript:alert(1)",
      "file:///reddit.com",
      "not a url",
      "https://redd.it/abc",
      "https://v.redd.it/video",
    ])
      expect(redditURL(url)).toBe(null);
  });
  test("accepts only Reddit paths Hydra can navigate", () => {
    for (const path of [
      "/",
      "/best",
      "/r/test",
      "/r/test/comments/abc/title/def",
      "/user/name",
      "/u/name",
      "/user/name/m/favorites",
      "/search?q=test",
      "/message/inbox",
      "/chat/abc",
    ])
      expect(typeof redditURL(`https://www.reddit.com${path}`)).toBe("string");
    for (const path of ["/gallery/abc", "/media", "/settings", "/message"])
      expect(redditURL(`https://www.reddit.com${path}`)).toBe(null);
    expect(openLink("https://www.reddit.com/gallery/abc", host)).toBe(null);
  });
  test("unwraps search results with supported search hosts", () => {
    const target = "https://www.reddit.com/r/test?sort=top&x=1";
    for (const wrapper of [
      "https://www.google.com/url?q=",
      "https://www.google.co.uk/url?q=",
      "https://duckduckgo.com/l/?uddg=",
      "https://www.bing.com/ck?url=",
    ])
      expect(openLink(wrapper + encodeURIComponent(target), host)).toBe(
        openLink(target, host),
      );
    expect(unwrap("https://evilgoogle.com/url?q=bad")).toBe(
      "https://evilgoogle.com/url?q=bad",
    );
    for (const wrapper of [
      "https://www.google.com.evil/url?q=",
      "https://www.google.evil/url?q=",
    ])
      expect(openLink(wrapper + encodeURIComponent(target), host)).toBe(null);
  });
  test("only accepts configured HTTPS host, route and exactly one valid target", () => {
    for (const url of [
      `https://evil.test/open?url=https://reddit.com/`,
      `http://${host}/open?url=https://reddit.com/`,
      `https://${host}/elsewhere?url=https://reddit.com/`,
      `https://${host}/open`,
      `https://${host}/open?url=%ZZ`,
      `https://${host}/open?url=https://evil.test/`,
      `https://${host}/open?url=${encodeURIComponent("https://www.reddit.com/gallery/abc")}`,
      `https://${host}/open?url=https://reddit.com/&url=https://reddit.com/r/test`,
      `https://user@${host}/open?url=https://reddit.com/`,
    ])
      expect(incomingLink(url, host)).toBe(null);
  });
  test("does not rewrite its own universal link", () => {
    expect(openLink(openLink("https://reddit.com/r/test", host)!, host)).toBe(
      null,
    );
  });
});
