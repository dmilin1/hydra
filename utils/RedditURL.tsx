import URL from "./URL";

export enum PageType {
    HOME,
    POST_DETAILS,
    SUBREDDIT,
    USER,
    SEARCH,

    ACCOUNTS,

    UNKNOWN,
}

export default class RedditURL extends URL {
    url: string;
  
    constructor(url: string) {
        super(url);
        if (url.startsWith('hydra://')) {
            this.url = url;
        } else if (url.startsWith('https://')) {
            this.url = url;
        } else if (url.startsWith('www')) {
            this.url = `https://${url}`;
        } else if (url.startsWith('reddit.com')) {
            this.url = `https://www.${url}`;
        } else if (
            url.startsWith('/r')
            || url.startsWith('/u')
            || url.startsWith('/search')
        ) {
            this.url = `https://www.reddit.com${url}`;
        } else {
            throw new Error(`Weird URL being passed ${url}`);
        }
        if (
            !this.url.startsWith('hydra://')
            && !this.url.startsWith('https://www.reddit.com')
            && !this.url.startsWith('https://i.redd.it')
            && !this.url.startsWith('https://v.redd.it')
        ) {
            throw new Error('Not a reddit URL');
        }
    }

    getSort(): string|null {
        const pageType = this.getPageType();
        if ([PageType.HOME, PageType.SUBREDDIT].includes(pageType)) {
            const sort = this.url.split(/\/r\/|\/|\?/).slice(3, 5) ?? [];
            for (let check of ['best', 'hot', 'new', 'top', 'rising']) {
                if (sort.includes(check)) {
                    return check;
                }
            }
        } else if (pageType === PageType.POST_DETAILS) {
            return this.getQueryParam('sort') ?? 'best';
        }
        return null;
    }

    changeSort(sort: string): RedditURL {
        const subreddit = this.getSubreddit();
        const urlParams = this.getURLParams();
        const pageType = this.getPageType();
        if (pageType === PageType.HOME) {
            this.url = `https://www.reddit.com/${sort.toLowerCase()}/?${urlParams}`;
        } else if (pageType === PageType.SUBREDDIT) {
            this.url = `https://www.reddit.com/r/${subreddit}/${sort.toLowerCase()}/?${urlParams}`;
        } else if (pageType === PageType.POST_DETAILS) {
            this.changeQueryParam('sort', sort.toLowerCase());
        }
        return this;
    }

    getSubreddit(): string {
        return this.url.split('/r/')[1]?.split(/\/|\?/)[0] ?? '';
    }

    jsonify(): RedditURL {
        const base = this.getBasePath();
        const urlParams = this.getURLParams();
        this.url = `${base}.json?${urlParams}`;
        return this;
    }
    
    getPageType(): PageType {
        const relativePath = this.getRelativePath();
        if (this.url.startsWith('hydra://accounts')) {
            return PageType.ACCOUNTS;
        } else if (
            relativePath === ''
            || relativePath === '/'
            || relativePath.startsWith('/best')
            || relativePath.startsWith('/hot')
            || relativePath.startsWith('/new')
            || relativePath.startsWith('/top')
            || relativePath.startsWith('/rising')
        ) {
            return PageType.HOME;
        } else if (relativePath.includes('/comments/')) {
            return PageType.POST_DETAILS;
        } else if (relativePath.startsWith('/r/')) {
            return PageType.SUBREDDIT;
        } else if (relativePath.startsWith('/u/') || relativePath.startsWith('/user/')) {
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
            name = relativePath.split('/')[1];
            name = name ? name : 'Home';
            name = name.charAt(0).toUpperCase() + name.slice(1);
        } else if (pageType === PageType.POST_DETAILS) {
            name = this.getSubreddit();
        } else if (pageType === PageType.SUBREDDIT) {
            name = this.getSubreddit();
        } else if (pageType === PageType.USER) {
            name = this.getRelativePath().split('/')[2] ?? 'User';   
        } else if (pageType === PageType.SEARCH) {
            name = 'Search';
        } else if (pageType === PageType.ACCOUNTS) {
            name = 'Accounts';
        } else if (pageType === PageType.UNKNOWN) {
            name = 'Error';
        }
        return name;
    }
}