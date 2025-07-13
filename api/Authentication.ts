import { USER_AGENT } from "./UserAgent";

type CurrentUser = {
  data: {
    modhash: string;
    name: string;
  };
};

export class UserAuth {
  static modhash?: string;
}

export class RateLimited extends Error {
  constructor() {
    super("Rate limited");
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const user = await fetch("https://www.reddit.com/user/me/about.json", {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
    headers: {
      "User-Agent": USER_AGENT,
    },
  }).then((response) => {
    if (response.status === 429) {
      throw new RateLimited();
    }
    return response.json();
  });

  if (user?.data?.modhash) {
    UserAuth.modhash = user.data.modhash;
    return user;
  }

  return null;
}
