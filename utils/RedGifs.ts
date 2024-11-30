import KeyStore from "./KeyStore";

const REDGIFS_TOKEN_STORAGE_KEY = "redgifsToken";

export default class Redgifs {
  static async getMediaURL(url: string, attemptsLeft = 1): Promise<string> {
    const videoId = url.split(/watch\/|\?|#/)[1];
    let token = Redgifs.getStoredToken();
    if (!token) {
      token = await Redgifs.refreshStoredToken();
    }
    try {
      return await fetch(`https://api.redgifs.com/v2/gifs/${videoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "Hydra",
        },
      })
        .then((res) => res.json())
        .then((json) => json.gif.urls.hd);
    } catch (_) {
      if (attemptsLeft > 0) {
        await Redgifs.refreshStoredToken();
        return await Redgifs.getMediaURL(url, attemptsLeft - 1);
      }
    }
    return url;
  }

  static getStoredToken() {
    return KeyStore.getString(REDGIFS_TOKEN_STORAGE_KEY);
  }

  static async refreshStoredToken(): Promise<string> {
    const token = await fetch("https://api.redgifs.com/v2/auth/temporary", {
      headers: {
        "User-Agent": "Hydra",
      },
    })
      .then((res) => res.json())
      .then((json) => json.token);
    KeyStore.set(REDGIFS_TOKEN_STORAGE_KEY, token);
    return token;
  }
}
