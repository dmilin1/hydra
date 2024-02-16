
export default class URL {
    url: string;
  
    constructor(url: string) {
        if (!url.startsWith('https://')) {
            this.url = `https://${url}`;
        } else {
            this.url = url;
        }
    }

    toString(): string {
        return this.url;
    }

    getHostName(): string {
        return this.url.split('https://')[1]?.split('/')[0] ?? '';
    }

    getBasePath(): string {
        return this.url.split('?')[0] ?? '';
    }

    getURLParams(): string {
        return this.url.split('?')[1] ?? '';
    }

    getRelativePath(): string {
        return this.url.split(/\.it|\.com|hydra:\/\/|\?/)[1] ?? '';
    }

    getQueryParam(key: string): string|null {
        const urlParams = this.getURLParams();
        const urlParamsObject = new URLSearchParams(urlParams);
        return urlParamsObject.get(key);
    }

    changeQueryParam(key: string, value: string): URL {
        const urlParams = this.getURLParams();
        const urlParamsObject = new URLSearchParams(urlParams);
        urlParamsObject.set(key, value);
        this.url = this.url.split('?')[0] + '?' + urlParamsObject.toString();
        return this;
    }

    setQueryParams(params: { [key: string]: string }): URL {
        const urlParams = this.getURLParams();
        const urlParamsObject = new URLSearchParams(urlParams);
        Object.keys(params).forEach(key => {
            if (params[key] != null) {
                urlParamsObject.set(key, params[key]);
            }
        });
        this.url = this.url.split('?')[0] + '?' + urlParamsObject.toString();
        return this;
    }
}