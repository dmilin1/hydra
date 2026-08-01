import KeyStore from "./KeyStore";

export const LINK_SCRIPT_KEY = "linkScript";
export const LINK_SCRIPT_ENABLED_KEY = "linkScriptEnabled";

export type LinkScriptResult = {
  url: string;
  error: string | null;
};

const SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Appending the return is what lets a script either reassign `url` or return
 * early, so snippets stacked in one script don't cut each other off.
 */
export function compileLinkScript() {
  const source = KeyStore.getString(LINK_SCRIPT_KEY) ?? "";
  try {
    const transform = new Function("url", `${source}\n;return url;`) as (
      url: string,
    ) => unknown;
    return { transform, error: null };
  } catch (error) {
    return { transform: null, error: String(error) };
  }
}

export function runLinkScript(url: string): LinkScriptResult {
  const { transform, error } = compileLinkScript();
  if (!transform) {
    return { url, error };
  }

  try {
    const output = transform(url);
    if (output == null || output === url) {
      return { url, error: null };
    }
    if (typeof output !== "string") {
      return {
        url,
        error: `The script returned a ${typeof output} instead of a link.`,
      };
    }
    if (!SCHEME_REGEX.test(output)) {
      return {
        url,
        error: `"${output}" isn't a link, so the original was opened instead.`,
      };
    }
    return { url: output, error: null };
  } catch (thrown) {
    return { url, error: String(thrown) };
  }
}

export function applyLinkScript(url: string): string {
  const enabled = KeyStore.getBoolean(LINK_SCRIPT_ENABLED_KEY) ?? false;
  return enabled ? runLinkScript(url).url : url;
}
