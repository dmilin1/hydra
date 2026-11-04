/**
 * Reddit's GraphQL API has no rendered HTML for posts and comments (post
 * content.html is plain text, comment html is null). It does return richtext:
 * Reddit's own parse of the markdown as a JSON document, which is what Reddit's
 * app renders. This turns it into the same HTML Reddit's old API returned, so
 * components/HTML/RenderHTML.tsx keeps working unchanged.
 *
 * Richtext format, as seen in responses and RtjsonFromMarkdown:
 *  - blocks: par, h{l}, blockquote, list{o}>li, code>raw, hr, img{id},
 *    video{id}, table{h: [{a, c}], c: [[{c}]]}
 *  - inline: text{t, f}, raw{t}, link{u, t, f}, r/{t, l}, u/{t, l},
 *    spoilertext{c}, br, gif{id}
 *  - f: [[formatBits, start, length]] ranges of t
 * img, gif and video refer to media assets by id (content.richtextMedia).
 */

type RichTextNode = {
  e: string;
  t?: string;
  f?: [number, number, number][];
  c?: any;
  u?: string;
  l?: boolean | number;
  o?: boolean;
  h?: { a?: string; c?: RichTextNode[] }[];
  id?: string;
};

type MediaSource = {
  url: string;
  dimensions?: { width: number; height: number };
};

type RichTextMedia = {
  id: string;
  mimetype?: string;
  url?: string;
  width?: number;
  height?: number;
  [size: string]: MediaSource | string | number | null | undefined;
};

// Format bits, outermost tag first.
const FORMATS: [number, string][] = [
  [1, "strong"],
  [2, "em"],
  [8, "del"],
  [32, "sup"],
  [64, "code"],
];

type RenderContext = {
  media: Map<string, RichTextMedia>;
  // Id (without prefix) of the post or comment being rendered.
  thingId?: string;
};

const MEDIA_SIZES = ["xxxlarge", "xxlarge", "xlarge", "large", "medium"];

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};
const NEEDS_ESCAPE = /[&<>"]/;
const ESCAPE_CHARS = /[&<>"]/g;

function escape(text: string): string {
  // Most text runs have nothing to escape, so test before copying.
  return NEEDS_ESCAPE.test(text)
    ? text.replace(ESCAPE_CHARS, (char) => ESCAPES[char])
    : text;
}

function wrapFormats(html: string, bits: number): string {
  for (let i = FORMATS.length - 1; i >= 0; i--) {
    const [bit, tag] = FORMATS[i];
    if (bits & bit) html = `<${tag}>${html}</${tag}>`;
  }
  return html;
}

/** Splits t into its formatted ranges and renders each through `render`. */
function renderFormatted(
  node: RichTextNode,
  render: (text: string) => string,
): string {
  // Reddit's offsets count code points, so an emoji is one, not two.
  const chars = Array.from(node.t ?? "");
  const slice = (from: number, to?: number) => chars.slice(from, to).join("");
  const ranges = [...(node.f ?? [])].sort((a, b) => a[1] - b[1]);
  let html = "";
  let position = 0;
  for (const [bits, start, length] of ranges) {
    if (start > position) html += render(slice(position, start));
    html += wrapFormats(render(slice(start, start + length)), bits);
    position = Math.max(position, start + length);
  }
  if (position < chars.length) html += render(slice(position));
  return html;
}

function mediaURL(media: RichTextMedia | undefined): string | undefined {
  if (!media) return undefined;
  for (const size of MEDIA_SIZES) {
    const source = media[size] as MediaSource | null | undefined;
    if (source?.url) return source.url;
  }
  return media.url;
}

function renderMedia(node: RichTextNode, ctx: RenderContext): string {
  const id = node.id;
  if (!id) return "";
  if (node.e === "video") {
    // The player link Reddit's HTML used for videos, which RenderHTML plays.
    const thing = escape(ctx.thingId ?? id);
    const url = `https://reddit.com/link/${thing}/video/${escape(id)}/player`;
    return `<a href="${url}">${url}</a>`;
  }
  if (id.startsWith("giphy|")) {
    // RenderHTML loads giphy links straight from Giphy.
    const giphyId = id.split("|")[1];
    return `<a href="https://giphy.com/gifs/${escape(giphyId)}">giphy</a>`;
  }
  const url = mediaURL(ctx.media.get(id));
  // A link to an image as a paragraph's only child renders as an image.
  return url ? `<a href="${escape(url)}">${escape(url)}</a>` : "";
}

function renderInline(
  nodes: RichTextNode[] | undefined,
  ctx: RenderContext,
): string {
  return (nodes ?? [])
    .map((node) => {
      switch (node.e) {
        case "text":
          return renderFormatted(node, escape);
        case "link":
          return renderFormatted(
            node,
            (text) => `<a href="${escape(node.u ?? "")}">${escape(text)}</a>`,
          );
        case "r/":
        case "u/": {
          const name = `${node.e}${node.t ?? ""}`;
          const text = node.l ? `/${name}` : name;
          return `<a href="/${escape(name)}">${escape(text)}</a>`;
        }
        case "spoilertext":
          return `<span class="md-spoiler-text">${renderInline(node.c, ctx)}</span>`;
        case "br":
          return "<br>";
        case "gif":
        case "img":
        case "video":
          return renderMedia(node, ctx);
        default:
          // raw, and anything unknown: its text.
          return escape(node.t ?? "");
      }
    })
    .join("");
}

function renderBlocks(
  nodes: RichTextNode[] | undefined,
  ctx: RenderContext,
): string {
  return (nodes ?? [])
    .map((node) => {
      switch (node.e) {
        case "par":
          return `<p>${renderInline(node.c, ctx)}</p>`;
        case "h": {
          const level = Math.min(Math.max(Number(node.l) || 1, 1), 6);
          return `<h${level}>${renderInline(node.c, ctx)}</h${level}>`;
        }
        case "blockquote":
          return `<blockquote>${renderBlocks(node.c, ctx)}</blockquote>`;
        case "list": {
          const tag = node.o ? "ol" : "ul";
          return `<${tag}>${renderBlocks(node.c, ctx)}</${tag}>`;
        }
        case "li":
          // Like Reddit's HTML, items with a single paragraph hold its text
          // directly (a <p> would add paragraph spacing inside the item).
          return node.c?.length === 1 && node.c[0].e === "par"
            ? `<li>${renderInline(node.c[0].c, ctx)}</li>`
            : `<li>${renderBlocks(node.c, ctx)}</li>`;
        case "code": {
          const lines = (node.c ?? []).map(
            (line: RichTextNode) => line.t ?? "",
          );
          return `<pre><code>${escape(lines.join("\n"))}</code></pre>`;
        }
        case "hr":
          return "<hr>";
        case "table":
          return renderTable(node, ctx);
        case "img":
        case "gif":
        case "video":
          return `<p>${renderMedia(node, ctx)}</p>`;
        default:
          // Unknown blocks: render their inline content, or their text.
          return node.c
            ? `<p>${renderInline(node.c, ctx)}</p>`
            : `<p>${escape(node.t ?? "")}</p>`;
      }
    })
    .join("");
}

function renderTable(node: RichTextNode, ctx: RenderContext): string {
  const align = (a?: string) =>
    a === "L"
      ? ' align="left"'
      : a === "C"
        ? ' align="center"'
        : a === "R"
          ? ' align="right"'
          : "";
  const headers = node.h ?? [];
  const head = headers
    .map((cell) => `<th${align(cell.a)}>${renderInline(cell.c, ctx)}</th>`)
    .join("");
  const rows = ((node.c ?? []) as { c?: RichTextNode[] }[][])
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell, i) =>
              `<td${align(headers[i]?.a)}>${renderInline(cell.c, ctx)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

function markdownToPlainHtml(markdown: string): string {
  return markdown
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim())
    .map((paragraph) => `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

/**
 * Converts a post's or comment's content to HTML. Falls back to the markdown
 * as plain paragraphs when there's no richtext. thingId (the post or comment
 * id, e.g. "phelff8") goes into video player links like in Reddit's HTML.
 */
export function contentToHtml(
  content: {
    richtext?: string | null;
    richtextMedia?: RichTextMedia[] | null;
    markdown?: string | null;
  },
  thingId?: string,
): string {
  const media = new Map(
    (content.richtextMedia ?? [])
      .filter((asset) => asset?.id)
      .map((asset) => [asset.id, asset]),
  );
  let body = "";
  try {
    const document = content.richtext
      ? JSON.parse(content.richtext)?.document
      : null;
    if (Array.isArray(document)) {
      body = renderBlocks(document, { media, thingId });
    }
  } catch (_e) {
    body = "";
  }
  if (!body && content.markdown) body = markdownToPlainHtml(content.markdown);
  // Merge adjacent identical tags:
  //  - richtext splits a formatted run around links into separate runs, e.g.
  //    **Please [read](...) this** -> <strong>Please </strong><strong><a>...
  //  - quotes separated by a blank line (">a\n\n>b") are separate blocks in
  //    richtext, but one quote in Reddit's HTML.
  body = body.replace(/<\/(strong|em|del|sup|code|blockquote)><\1>/g, "");
  return body ? `<div class="md">${body}</div>` : "";
}
