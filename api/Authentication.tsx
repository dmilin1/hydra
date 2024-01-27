import { Account } from "../contexts/AccountContext";

export async function login(account: Account): Promise<any> {
    const formdata = new FormData();
    formdata.append("user", account.username);
    formdata.append("passwd", account.password);

    return await fetch("https://ssl.reddit.com/api/login", {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    });
}

export async function logout() : Promise<any> {
    const user = await fetch('https://www.reddit.com/user/me/about.json', {
        method: 'GET',
        redirect: 'follow',
    }).then(response => response.json());

    var formdata = new FormData();
    formdata.append("uh", user.data.modhash);

    return await fetch("https://www.reddit.com/logout", {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    });
}
