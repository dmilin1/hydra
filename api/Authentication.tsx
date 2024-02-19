import { Account } from "../contexts/AccountContext";

export class UserAuth {
    static modhash?: string;
};

export async function login(account: Account): Promise<void> {
    const formdata = new FormData();
    formdata.append("user", account.username);
    formdata.append("passwd", account.password);

    await fetch("https://ssl.reddit.com/api/login", {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    });

    UserAuth.modhash = undefined;
}

export async function logout() : Promise<void> {
    const user = await fetch('https://www.reddit.com/user/me/about.json', {
        method: 'GET',
        redirect: 'follow',
    }).then(response => response.json());

    UserAuth.modhash = user.data.modhash;

    var formdata = new FormData();
    formdata.append("uh", user.data.modhash);

    await fetch("https://www.reddit.com/logout", {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    });
}
