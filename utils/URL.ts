import { Parser } from "htmlparser2";
import safeFetch from "./safeFetch";

export type OpenGraphData = {
  title?: string;
  type?: string;
  image?: string;
  url?: string;
  description?: string;
};

export default class URL {
  url: string;

  constructor(url: string) {
    if (!url.startsWith("https://")) {
      this.url = `https://${url}`;
    } else {
      this.url = url;
    }
  }

  toString(): string {
    return this.url;
  }

  getPrettyHostName(): string {
    return this.getHostName().replace("www.", "");
  }

  getHostName(): string {
    return this.url.split("https://")[1]?.split("/")[0] ?? "";
  }

  getBasePath(): string {
    return this.url.split(/\?|\#/)[0] ?? "";
  }

  getURLParams(): string {
    return this.url.split("?")[1] ?? "";
  }

  getRelativePath(): string {
    return this.url.split(/\.it|\.com|hydra:\/\/|\?/)[1] ?? "";
  }

  getQueryParam(key: string): string | null {
    const urlParams = this.getURLParams();
    const urlParamsObject = new URLSearchParams(urlParams);
    return urlParamsObject.get(key);
  }

  changeQueryParam(key: string, value: string): URL {
    const urlParams = this.getURLParams();
    const urlParamsObject = new URLSearchParams(urlParams);
    urlParamsObject.set(key, value);
    this.url = this.url.split("?")[0] + "?" + urlParamsObject.toString();
    return this;
  }

  setQueryParams(params: { [key: string]: string }): URL {
    const urlParams = this.getURLParams();
    const urlParamsObject = new URLSearchParams(urlParams);
    Object.keys(params).forEach((key) => {
      if (params[key] != null) {
        urlParamsObject.set(key, params[key]);
      }
    });
    this.url = this.url.split("?")[0] + "?" + urlParamsObject.toString();
    return this;
  }

  deleteQueryParam(key: string): URL {
    const urlParams = this.getURLParams();
    const urlParamsObject = new URLSearchParams(urlParams);
    urlParamsObject.delete(key);
    this.url = this.url.split("?")[0] + "?" + urlParamsObject.toString();
    return this;
  }

  async getOpenGraphData(): Promise<OpenGraphData | undefined> {
    try {
      const res = await safeFetch(this.url, {
        timeout: 1_750, // Don't slow down loads if some site is slow to respond
      });
      const html = await res.text();
      const results: OpenGraphData = {};
      const parser = new Parser({
        onopentag(name, attribs) {
          if (name === "meta" && attribs.property?.startsWith("og:")) {
            const key = attribs.property.split("og:")[1] as keyof OpenGraphData;
            if (key === "image" && attribs.content?.includes(".svg")) {
              /**
               * Certain SVGs cause a crash in expo-image. Unfortunately,
               * that means we can't load any SVGs until it gets fixed.
               * https://github.com/expo/expo/issues/24885
               *
               * Example SVG that causes the crash:
               * https://www.telegraph.co.uk/etc.clientlibs/settings/wcm/designs/telegraph/core/clientlibs/core/resources/icons/tmg-share-img.svg
               */
              return;
            }
            results[key] = attribs.content;
          }
        },
      });
      parser.write(html);
      parser.end();
      return results;
    } catch (_) {
      // if we can't get the open graph data, just return undefined
    }
  }
}
