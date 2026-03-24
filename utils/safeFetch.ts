/**
 * A fetch-like wrapper around XMLHttpRequest that avoids the whatwg-fetch
 * polyfill bug where invalid status codes (like 0) cause uncatchable errors.
 *
 * I wrote this because getting open graph data from LinkedIn was returning
 * a 999 status code. whatwg-fetch handles fetch requests inside a setTimeout
 * internally making it impossible to catch with a try/catch block.
 */

export type SafeFetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData | null;
  timeout?: number;
  cache?: RequestCache;
};

export type SafeFetchResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  text: () => Promise<string>;
  json: <T = any>() => Promise<T>;
  blob: () => Promise<Blob>;
};

const CACHE_MODE_HEADERS: Partial<
  Record<RequestCache, Record<string, string>>
> = {
  "no-store": { Pragma: "no-cache", "Cache-Control": "no-cache" },
  reload: { Pragma: "no-cache", "Cache-Control": "no-cache" },
  "no-cache": { "Cache-Control": "max-age=0" },
};

export default function safeFetch(
  url: string,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method?.toUpperCase() ?? "GET";

    xhr.open(method, url, true);

    const headers = options.headers ?? {};
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    if (options.cache) {
      const has = (name: string) =>
        Object.keys(headers).some(
          (k) => k.toLowerCase() === name.toLowerCase(),
        );

      const cacheHeaders = CACHE_MODE_HEADERS[options.cache];
      if (!cacheHeaders) return;

      Object.entries(cacheHeaders).forEach(([key, value]) => {
        if (!has(key)) xhr.setRequestHeader(key, value);
      });
    }

    xhr.timeout = options.timeout ?? 10_000;

    xhr.onload = () => {
      try {
        const headersString = xhr.getAllResponseHeaders();
        const headersArray = headersString.trim().split(/[\r\n]+/);
        const headers = new Headers();
        headersArray.forEach((line) => {
          const separatorIndex = line.indexOf(":");
          if (separatorIndex === -1) return;
          const key = line.substring(0, separatorIndex).trim();
          const value = line.substring(separatorIndex + 1).trim();
          if (key) {
            try {
              headers.append(key, value);
            } catch (_) {
              // Skip headers with names the runtime considers invalid
            }
          }
        });

        const response: SafeFetchResponse = {
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          statusText: xhr.statusText,
          headers,
          url: xhr.responseURL || url,
          text: () => Promise.resolve(xhr.responseText),
          json: <T = unknown>() =>
            new Promise<T>((res, rej) => {
              try {
                res(JSON.parse(xhr.responseText) as T);
              } catch (e) {
                rej(e);
              }
            }),
          blob: () => Promise.resolve(new Blob([xhr.response])),
        };

        resolve(response);
      } catch (e) {
        reject(e);
      }
    };

    xhr.onerror = () => {
      reject(new TypeError("Network request failed"));
    };

    xhr.ontimeout = () => {
      reject(new TypeError("Network request timed out"));
    };

    xhr.onabort = () => {
      reject(new DOMException("Request aborted", "AbortError"));
    };

    xhr.send(options.body ?? null);
  });
}
