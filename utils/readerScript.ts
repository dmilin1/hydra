import readability from "@mozilla/readability/Readability.js";

export function readerScript(
  enabled: boolean,
  background: string,
  color: string,
) {
  return `(function () {
    var existing = document.getElementById('hydra-reader-overlay');
    if (existing) { existing.remove(); document.documentElement.style.overflow = window.__hydraOverflow || ''; }
    if (!${enabled}) return;
    try {
      ${readability}
      var article = new Readability(document.cloneNode(true)).parse();
      if (!article || !article.textContent || article.textContent.trim().length < 100) throw new Error('No article');
      var overlay = document.createElement('div');
      overlay.id = 'hydra-reader-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;overflow:auto;padding:24px;box-sizing:border-box;font:20px/1.7 Georgia,serif;';
      overlay.style.background = ${JSON.stringify(background)};
      overlay.style.color = ${JSON.stringify(color)};
      var body = document.createElement('article');
      body.style.cssText = 'max-width:720px;margin:auto;overflow-wrap:anywhere;';
      var title = document.createElement('h1'); title.textContent = article.title; body.appendChild(title);
      var parsed = new DOMParser().parseFromString(article.content, 'text/html');
      function copy(node, target) {
        if (node.nodeType === 3) { target.appendChild(document.createTextNode(node.textContent)); return; }
        if (node.nodeType !== 1 || /^(SCRIPT|STYLE|IFRAME|OBJECT|FORM|SVG)$/.test(node.tagName)) return;
        var allowed = /^(A|P|H2|H3|H4|BLOCKQUOTE|UL|OL|LI|STRONG|EM|B|I|BR|PRE|CODE|FIGCAPTION)$/.test(node.tagName);
        var next = allowed ? document.createElement(node.tagName) : target;
        if (allowed) { next.style.color = 'inherit'; if (node.tagName === 'PRE') next.style.whiteSpace = 'pre-wrap'; target.appendChild(next); }
        if (node.tagName === 'A') {
          try { var href = new URL(node.getAttribute('href'), document.baseURI); if (/^https?:$/.test(href.protocol)) next.href = href.href; } catch (_) {}
        }
        Array.from(node.childNodes).forEach(function(child) { copy(child, next); });
      }
      Array.from(parsed.body.childNodes).forEach(function(node) { copy(node, body); });
      overlay.appendChild(body); document.documentElement.appendChild(overlay);
      window.__hydraOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    } catch (e) { window.ReactNativeWebView.postMessage('hydra-reader-unavailable'); }
  })(); true;`;
}
