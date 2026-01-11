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
};

export type SafeFetchResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  text: () => Promise<string>;
  json: <T = unknown>() => Promise<T>;
  blob: () => Promise<Blob>;
};

export default function safeFetch(
  url: string,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method?.toUpperCase() ?? "GET";

    xhr.open(method, url, true);

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    if (options.timeout) {
      xhr.timeout = options.timeout;
    }

    xhr.onload = () => {
      const headersString = xhr.getAllResponseHeaders();
      const headersArray = headersString.trim().split(/[\r\n]+/);
      const headers = new Headers();
      headersArray.forEach((line) => {
        const parts = line.split(": ");
        const key = parts.shift();
        const value = parts.join(": ");
        if (key) {
          headers.append(key, value);
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
          Promise.resolve(JSON.parse(xhr.responseText) as T),
        blob: () => Promise.resolve(new Blob([xhr.response])),
      };

      resolve(response);
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
