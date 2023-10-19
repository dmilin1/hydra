
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
        const newURL = `https://www.reddit.com${subreddit ? `/r/${subreddit}` : ''}/${sort.toLowerCase()}/?${urlParams}`;
        this.url = newURL;
        return this;
    }

    getSubreddit(): string {
        return this.url.split('/r/')[1]?.split(/\/|\?/)[0] ?? '';
    }

    getURLParams(): string {
        return this.url.split('?')[1] ?? '';
    }

    getRelativePath(): string {
        return this.url.split(/\.com|\?/)[1] ?? '';
    }
}