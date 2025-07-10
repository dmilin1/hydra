const iosVersion = Math.floor(Math.random() * 5) + 9;
const safariVersion = Math.floor(Math.random() * 5) + 600;
const webkitVersion = Math.floor(Math.random() * 700) + 500;
const osPlatform = `CPU iPhone OS ${iosVersion}_${Math.floor(Math.random() * 10)} like Mac OS X) AppleWebKit/${webkitVersion}.60 (KHTML, like Gecko) Version/${safariVersion}.0 Mobile/15E148 Safari/${webkitVersion}.60`;

export const USER_AGENT = `Mozilla/5.0 (${osPlatform}`;
