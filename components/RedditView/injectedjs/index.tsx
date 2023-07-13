// @ts-nocheck

import { emitMessage, log } from "./EmitMessage";
import { getPosts } from "./Posts";
import { waitForLoad } from "./WaitForLoad";

function grabData() {
  'do not compile';
  (async () => {
    if (window.injected) {
      return;
    }
    window.injected = true;
    log('waiting');
    await waitForLoad();
    log('loaded');
    const data = {
      posts: getPosts(),
    }
    log(data);
  })()
}

const functions = [
  grabData,
  emitMessage,
  log,
  getPosts,
  waitForLoad,
];

const injectedJSBundle = functions.map(f => f.toString()).join('\n\n') + `\n\grabData();`;

export default injectedJSBundle;