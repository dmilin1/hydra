export enum PageType {
    HOME,
    POST_DETAILS,
    SUBREDDIT,
    USER,
    SEARCH,
    UNKNOWN,
}

export default class RedditURL {
    url: string;
  
    constructor(url: string) {
        if (url.startsWith('https://')) {
            this.url = url;
        } else if (url.startsWith('www')) {
            this.url = `https://${url}`;
        } else if (url.startsWith('reddit.com')) {
            this.url = `https://www.${url}`;
        } else if (url.startsWith('/')) {
            this.url = `https://www.reddit.com${url}`;
        } else {
            throw new Error(`Weird URL being passed ${url}`);
        }
    }

    toString(): string {
        return this.url;
    }

    changeSort(sort: string): RedditURL {
        const subreddit = this.getSubreddit();
        const urlParams = this.getURLParams();
        if (this.getPageType() === PageType.HOME) {
            this.url = `https://www.reddit.com${subreddit ? `/r/${subreddit}` : ''}/${sort.toLowerCase()}/?${urlParams}`;
        } else {
            this.changeQueryParam('sort', sort);
        }
        return this;
    }

    getSubreddit(): string {
        return this.url.split('r/')[1]?.split(/\/|\?/)[0] ?? '';
    }

    getURLParams(): string {
        return this.url.split('?')[1] ?? '';
    }

    getRelativePath(): string {
        return this.url.split(/\.com|\?/)[1] ?? '';
    }

    changeQueryParam(key: string, value: string): RedditURL {
        const urlParams = this.getURLParams();
        const urlParamsObject = new URLSearchParams(urlParams);
        urlParamsObject.set(key, value);
        this.url = this.url.split('?')[0] + '?' + urlParamsObject.toString();
        return this;
    }

    getPageType(): PageType {
        const relativePath = this.getRelativePath();
        if (
            relativePath === ''
            || relativePath === '/'
            || relativePath === '/best'
            || relativePath === '/hot'
            || relativePath === '/new'
            || relativePath === '/top'
            || relativePath === '/rising'
        ) {
            return PageType.HOME;
        } else if (relativePath.includes('/comments/')) {
            return PageType.POST_DETAILS;
        } else if (relativePath.startsWith('/r/')) {
            return PageType.SUBREDDIT;
        } else if (relativePath.startsWith('/u/')) {
            return PageType.USER;
        } else if (relativePath.startsWith('/search')) {
            return PageType.SEARCH;
        } else {
            return PageType.UNKNOWN;
        }
    }

    getPageName(): string {
        let name = '';
        const pageType = this.getPageType();
        if (pageType === PageType.HOME) {
            const relativePath = this.getRelativePath();
            name = relativePath.split('/')[1] ?? 'Home';
            name = name.charAt(0).toUpperCase() + name.slice(1);
        } else if (pageType === PageType.POST_DETAILS) {
            name = this.getSubreddit();
        } else if (pageType === PageType.SUBREDDIT) {
            name = this.getSubreddit();
        } else if (pageType === PageType.USER) {
            name = this.getRelativePath().split('/')[2] ?? 'User';   
        } else if (pageType === PageType.SEARCH) {
            name = 'Search';
        } else if (pageType === PageType.UNKNOWN) {
            name = 'Error';
        }
        return name;
    }
}