import RedditURL from "../utils/RedditURL";

type ApiOptions = {
    depaginate?: boolean,
}

export async function api(
    url: string,
    fetchOptions: RequestInit|undefined = undefined,
    apiOptions : ApiOptions = {}
) : Promise<any> {
    const authorizedHeaders = new Headers(fetchOptions?.headers);
    const session = '31202562%2C2023-10-19T23%3A40%3A58%2C91bd491ae0da25260eefb4c61fbd12919b391b3c';
    authorizedHeaders.set('cookie', `reddit_session=${session};`);
    const res = await fetch(url, fetchOptions);
    const json = await res.json();
    if (apiOptions.depaginate) {
        if (json?.data?.after !== null) {
            const newURL = (new RedditURL(url)).changeQueryParam('after', json.data.after).toString();
            const nextJson = await api(newURL, fetchOptions, apiOptions);
            return [...json.data.children, ...nextJson];
        } else {
            return json.data.children;
        }
    }
    return json;
}