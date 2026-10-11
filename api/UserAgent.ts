// Only the iOS version varies between real iPhones; every other token is frozen
// by Apple, so randomizing them would fingerprint us instead of blending in.
const majors = [16, 17, 18, 26];
const major = majors[Math.floor(Math.random() * majors.length)];
const minor = Math.floor(Math.random() * 6);

export const USER_AGENT = `Mozilla/5.0 (iPhone; CPU iPhone OS ${major}_${minor} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${major}.${minor} Mobile/15E148 Safari/604.1`;
