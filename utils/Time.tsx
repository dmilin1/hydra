export default class Time {
    time: Date;

    constructor(time: string|number) {
        this.time = new Date(time);
    }

    prettyTimeSince(): string {
        const now = new Date();
        const diff = Math.abs(now.getTime() - this.time.getTime());
        const diffSeconds = Math.floor(diff / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);
        if (diffSeconds < 60) {
            return `${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffDays < 30) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        } else if (diffMonths < 12) {
            return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
        } else {
            return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
        }
    }
}