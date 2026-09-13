/// <reference types="node" />
import { describe, expect, test } from "bun:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const babel = require("@babel/core");
const inlineImport = require("babel-plugin-inline-import");
const ts = require("typescript");
const { JSDOM } = require("jsdom");

const filename = fileURLToPath(
  new URL("../utils/readerScript.ts", import.meta.url),
);
const transformed = babel.transformSync(readFileSync(filename, "utf8"), {
  filename,
  configFile: false,
  babelrc: false,
  parserOpts: { plugins: ["typescript"] },
  plugins: [[inlineImport, { extensions: ["Readability.js"] }]],
}).code;
const compiled = ts.transpileModule(transformed, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const exported: {
  readerScript: (enabled: boolean, background: string, color: string) => string;
} = { readerScript: () => "" };
new Function("exports", compiled)(exported);
const { readerScript } = exported;

const page = (html: string) => {
  const dom = new JSDOM(html, {
    url: "https://example.com/article",
    runScripts: "outside-only",
  });
  const messages: string[] = [];
  dom.window.ReactNativeWebView = {
    postMessage: (message: string) => messages.push(message),
  };
  return { dom, messages };
};

describe("readerScript", () => {
  test("extracts an article, respects the theme, and restores the live document", () => {
    const paragraph =
      "This is a detailed article about the natural world. It contains useful information, observations, and explanations for readers. ".repeat(
        12,
      );
    const { dom, messages } = page(
      `<html><head><title>Article title</title></head><body><nav>Navigation</nav><input value="keep me"><article><h1>Article title</h1><p>${paragraph}</p><p>${paragraph}</p><script>untrusted()</script></article></body></html>`,
    );
    const document = dom.window.document;
    const input = document.querySelector("input");
    input.value = "edited live value";
    document.documentElement.style.overflow = "scroll";

    dom.window.eval(readerScript(true, "#000000", "#ffffff"));
    const overlay = document.getElementById("hydra-reader-overlay");
    expect(overlay).toBeTruthy();
    expect(overlay.textContent).toContain("Article title");
    expect(overlay.style.background).toBe("rgb(0, 0, 0)");
    expect(overlay.querySelector("script")).toBeNull();
    expect(overlay.querySelector("input")).toBeNull();
    expect(messages).toEqual([]);

    dom.window.eval(readerScript(true, "#000000", "#ffffff"));
    expect(document.querySelectorAll("#hydra-reader-overlay").length).toBe(1);

    dom.window.eval(readerScript(false, "#000000", "#ffffff"));
    expect(document.getElementById("hydra-reader-overlay")).toBeNull();
    expect(document.querySelector("input")).toBe(input);
    expect(input.value).toBe("edited live value");
    expect(document.documentElement.style.overflow).toBe("scroll");
    dom.window.close();
  });

  test("leaves non-article pages intact and reports reader unavailability", () => {
    const { dom, messages } = page(
      '<html><body><form><input value="Search"></form></body></html>',
    );
    dom.window.eval(readerScript(true, "#000", "#fff"));
    expect(
      dom.window.document.getElementById("hydra-reader-overlay"),
    ).toBeNull();
    expect(dom.window.document.querySelector("form")).toBeTruthy();
    expect(messages).toEqual(["hydra-reader-unavailable"]);
    dom.window.close();
  });
});
