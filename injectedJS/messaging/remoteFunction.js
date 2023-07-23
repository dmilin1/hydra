export class RemoteFn {
    static remoteFunctions = {};

    constructor(name, fn) {
        this.name = name;
        RemoteFn.remoteFunctions[name] = fn;
    }

    static execute(name, args) {
        const parsedArgs = JSON.parse(args);
        RemoteFn.remoteFunctions[name]?.(...parsedArgs);
    }
}

window.RemoteFn = RemoteFn;