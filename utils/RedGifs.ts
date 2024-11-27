import AsyncStorage from "@react-native-async-storage/async-storage";

export default class Redgifs {
  static async getMediaURL(url: string, attemptsLeft = 1): Promise<string> {
    const videoId = url.split(/watch\/|\?|#/)[1];
    let token = await Redgifs.getStoredToken();
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

  static async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem("redgifsToken");
  }

  static async refreshStoredToken(): Promise<string> {
    const token = await fetch("https://api.redgifs.com/v2/auth/temporary", {
      headers: {
        "User-Agent": "Hydra",
      },
    })
      .then((res) => res.json())
      .then((json) => json.token);
    await AsyncStorage.setItem("redgifsToken", token);
    return token;
  }
}
