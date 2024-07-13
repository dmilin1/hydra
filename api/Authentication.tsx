import { Account } from "../contexts/AccountContext";
import RedditCookies from "../utils/RedditCookies";

type CurrentUser = {
  data: {
    modhash: string;
    name: string;
  };
};

export class UserAuth {
  static modhash?: string;
}

export class IncorrectCredentials extends Error {
  constructor() {
    super("Incorrect credentials");
  }
}
export class Needs2FA extends Error {
  constructor() {
    super("2FA is required");
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const user = await fetch("https://www.reddit.com/user/me/about.json", {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
  }).then((response) => response.json());

  if (user?.data?.modhash) {
    UserAuth.modhash = user.data.modhash;
    return user;
  }

  return null;
}

export async function login(account: Account): Promise<void> {
  const formdata = new FormData();
  formdata.append("user", account.username);
  formdata.append("passwd", account.password);

  await logout();

  const res = await fetch("https://ssl.reddit.com/api/login", {
    method: "POST",
    body: formdata,
    redirect: "follow",
  }).then((response) => response.json());

  if (res?.success !== true) {
    console.log(await getCurrentUser());
    console.log(account);
    console.log(res);
    throw new IncorrectCredentials();
  }

  const user = await getCurrentUser();

  if (!user?.data?.modhash) {
    throw new Needs2FA();
  }

  UserAuth.modhash = user.data.modhash;
}

export async function logout(): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    UserAuth.modhash = undefined;
    return;
  }

  const formdata = new FormData();
  formdata.append("uh", user.data.modhash);

  await fetch("https://www.reddit.com/logout", {
    method: "POST",
    body: formdata,
    redirect: "follow",
  });

  await RedditCookies.clearSessionCookies();
  UserAuth.modhash = undefined;
}
