import RedditURL from "../utils/RedditURL";
import { UserAuth } from "./Authentication";

type ApiOptions = {
    depaginate?: boolean,
}

export async function api(
    url: string,
    fetchOptions: RequestInit = {},
    apiOptions : ApiOptions = {}
) : Promise<any> {
    const authorizedHeaders: HeadersInit = new Headers(fetchOptions?.headers);
    authorizedHeaders.set('X-Modhash', UserAuth.modhash ?? '');
    fetchOptions.headers = authorizedHeaders;

    // fetchOptions.cache = 'no-store';
    const res = await fetch(url, fetchOptions);
    const json = await res.json();
    if (apiOptions.depaginate) {
        if (json?.data?.after != null) {
            const newURL = (new RedditURL(url)).changeQueryParam('after', json.data.after).toString();
            const nextJson = await api(newURL, fetchOptions, apiOptions);
            return [...json.data.children, ...nextJson];
        } else {
            return json.data.children;
        }
    }
    return json;
}
