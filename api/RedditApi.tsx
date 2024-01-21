import RedditURL from "../utils/RedditURL";

type ApiOptions = {
    depaginate?: boolean,
}

export async function api(
    url: string,
    fetchOptions: RequestInit = {},
    apiOptions : ApiOptions = {}
) : Promise<any> {
    // const authorizedHeaders: HeadersInit = new Headers(fetchOptions?.headers);
    // const session = '31202562%2C2024-01-11T04%3A33%3A58%2C05175d8079769e84701ae0d54affd0329a12dde7';
    // authorizedHeaders.set('cookie', `reddit_session=${session};`);
    // fetchOptions.headers = authorizedHeaders;
    fetchOptions.cache = 'no-store';
    const res = await fetch(url, fetchOptions);
    const json = await res.json();
    console.log(url, json);
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

export async function login() : Promise<any> {
    const formdata = new FormData();
    formdata.append("user", "dmilin");
    formdata.append("passwd", "***REMOVED***");

    fetch("https://ssl.reddit.com/api/login", {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

export async function logout() : Promise<any> {
    const user = await fetch('https://www.reddit.com/user/me/about.json', { method: 'GET' })
        .then(response => response.json());

    var formdata = new FormData();
    formdata.append("uh", user.data.modhash);

    fetch("https://www.reddit.com/logout", {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}