/// <reference types="node" />
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import * as HydraLinks from "../extensions/open-in-hydra/links";

// Exercise the shipped content script, including document_start, mutations and
// default tap behavior, without loading React Native or requiring Safari.
function load(href: string, referrer = "") {
  class Element {
    parentElement: Element | null = null;
    children: Element[] = [];
    scans = 0;
    append(child: Element) {
      child.parentElement = this;
      this.children.push(child);
    }
    matches() {
      return false;
    }
    querySelectorAll(): Anchor[] {
      this.scans++;
      const anchors: Anchor[] = [];
      const visit = (node: Element) => {
        for (const child of node.children) {
          if (child instanceof Anchor) anchors.push(child);
          visit(child);
        }
      };
      visit(this);
      return anchors;
    }
  }
  class Anchor extends Element {
    constructor(public href: string) {
      super();
    }
    matches() {
      return true;
    }
  }
  let click: (event: { composedPath: () => unknown[] }) => void = () => {};
  let mutations: (records: unknown[]) => void = () => {};
  let clickOptions: unknown;
  const redirects: string[] = [];
  const checkedLinks: string[] = [];
  runInNewContext(
    readFileSync(
      new URL("../extensions/open-in-hydra/content.js", import.meta.url),
      "utf8",
    ),
    {
      HydraLinks: {
        ...HydraLinks,
        openLink: (value: string, host: string) => {
          checkedLinks.push(value);
          return HydraLinks.openLink(value, host);
        },
      },
      HYDRA_LINK_HOST: "open.example.com",
      Element,
      HTMLAnchorElement: Anchor,
      URL,
      URLSearchParams,
      document: {
        documentElement: null,
        referrer,
        addEventListener: (
          _name: string,
          callback: typeof click,
          options: unknown,
        ) => {
          click = callback;
          clickOptions = options;
        },
      },
      MutationObserver: class {
        constructor(callback: typeof mutations) {
          mutations = callback;
        }
        observe() {}
      },
      location: {
        href,
        hostname: new URL(href).hostname,
        replace: (url: string) => redirects.push(url),
      },
    },
  );
  return {
    Element,
    Anchor,
    redirects,
    checkedLinks,
    clickOptions,
    click: (anchor: Anchor) => click({ composedPath: () => [anchor] }),
    mutations: (records: unknown[]) => mutations(records),
  };
}

describe("Safari content script", () => {
  test("loads the parser and host config before the content script", () => {
    const manifest = JSON.parse(
      readFileSync(
        new URL("../extensions/open-in-hydra/manifest.json", import.meta.url),
        "utf8",
      ),
    );
    const script = manifest.content_scripts[0];
    expect(script.run_at).toBe("document_start");
    expect(script.js).toEqual(["links.js", "config.js", "content.js"]);
  });
  test("preserves fallback links on the universal-link host", () => {
    const context = load(
      "https://open.example.com/open?url=https://reddit.com/",
    );
    const anchor = new context.Anchor("https://reddit.com/r/test");
    context.click(anchor);
    expect(anchor.href).toBe("https://reddit.com/r/test");
  });
  test("rewrites trusted tap's anchor while keeping default navigation", () => {
    const context = load("https://example.com/");
    const anchor = new context.Anchor("https://reddit.com/r/test");
    context.click(anchor); // No preventDefault/stopPropagation API supplied.
    expect(context.clickOptions).toBe(true);
    expect(anchor.href).toBe(
      HydraLinks.openLink("https://reddit.com/r/test", "open.example.com"),
    );
    expect(context.redirects).toEqual([]);
  });
  test("handles links inserted or changed after document_start", () => {
    const context = load("https://example.com/");
    const anchor = new context.Anchor("https://old.reddit.com/r/test");
    context.mutations([{ type: "childList", addedNodes: [anchor] }]);
    expect(HydraLinks.incomingLink(anchor.href, "open.example.com")).toBe(
      "https://www.reddit.com/r/test",
    );
    anchor.href = "https://www.reddit.com/r/other";
    context.mutations([{ type: "attributes", target: anchor }]);
    expect(HydraLinks.incomingLink(anchor.href, "open.example.com")).toBe(
      "https://www.reddit.com/r/other",
    );
  });
  test("scans overlapping additions once regardless of record order", () => {
    const context = load("https://example.com/");
    const nodes = Array.from({ length: 4 }, () => new context.Element());
    const anchors = nodes.map((node, index) => {
      const anchor = new context.Anchor(`https://reddit.com/r/test${index}`);
      node.append(anchor);
      if (index > 0) nodes[index - 1].append(node);
      return anchor;
    });
    context.checkedLinks.length = 0;
    context.mutations([
      { type: "attributes", target: anchors[0] },
      ...nodes
        .toReversed()
        .map((node) => ({ type: "childList", addedNodes: [node] })),
      { type: "childList", addedNodes: [nodes[0]] },
    ]);
    expect(context.checkedLinks.length).toBe(nodes.length);
    expect(nodes.map((node) => node.scans)).toEqual([
      1,
      ...Array(nodes.length - 1).fill(0),
    ]);
    for (const [index, anchor] of anchors.entries()) {
      expect(HydraLinks.incomingLink(anchor.href, "open.example.com")).toBe(
        `https://www.reddit.com/r/test${index}`,
      );
    }
  });
  test("keeps disjoint additions and deduplicates href changes", () => {
    const context = load("https://example.com/");
    const first = new context.Anchor("https://reddit.com/r/first");
    const second = new context.Anchor("https://reddit.com/r/second");
    context.checkedLinks.length = 0;
    context.mutations([
      { type: "childList", addedNodes: [first, second, {}] },
      { type: "attributes", target: first },
      { type: "attributes", target: first },
    ]);
    expect(context.checkedLinks.length).toBe(2);
    expect(HydraLinks.incomingLink(first.href, "open.example.com")).toBe(
      "https://www.reddit.com/r/first",
    );
    expect(HydraLinks.incomingLink(second.href, "open.example.com")).toBe(
      "https://www.reddit.com/r/second",
    );
  });
  test("attempts direct Reddit redirect once and ignores its destination", () => {
    const context = load("https://www.reddit.com/r/test");
    expect(context.redirects.length).toBe(1);
    expect(load(context.redirects[0]).redirects).toEqual([]);
  });
  test("keeps Reddit navigation from the fallback in Safari", () => {
    const context = load(
      "https://www.reddit.com/r/test",
      "https://open.example.com/open?url=https://reddit.com/r/test",
    );
    const anchor = new context.Anchor("https://www.reddit.com/r/other");
    context.click(anchor);
    expect(context.redirects).toEqual([]);
    expect(anchor.href).toBe("https://www.reddit.com/r/other");
    expect(
      load(
        "https://www.reddit.com/r/test",
        "https://elsewhere.example/open?url=https://reddit.com/r/test",
      ).redirects.length,
    ).toBe(1);
  });
  test("leaves unrelated links unchanged", () => {
    const context = load("https://example.com/");
    const anchor = new context.Anchor("https://example.com/page");
    context.click(anchor);
    expect(anchor.href).toBe("https://example.com/page");
  });
});
