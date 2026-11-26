import { AnyNode, Text as TextNode, Element as ElementNode } from "domhandler";
import { openExternalLink } from "../../utils/openExternalLink";
import { parseDocument, ElementType } from "htmlparser2";
import React, { useContext, useMemo, useState } from "react";
import {
  ColorValue,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import RedditURL, { PageType } from "../../utils/RedditURL";
import { useURLNavigation } from "../../utils/navigation";
import ImageViewer from "../RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageViewer";
import ThemeImport from "../UI/Themes/ThemeImport";
import { extractThemeFromText } from "../../utils/colors";
import { CUSTOM_THEME_IMPORT_PREFIX } from "../../constants/Themes";
import URL from "../../utils/URL";
import {
  InterceptingGestureDetector,
  Touchable,
  useTapGesture,
  VirtualGestureDetector,
} from "react-native-gesture-handler";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { MediaViewerContext } from "../../contexts/MediaViewerContext";
import { getTextDirection, TextDirection } from "../../utils/textDirection";

/**
 * Test Post:
 * https://www.reddit.com/r/test/comments/1y4qysr/formatting_test/
 */

// RN 0.88 style types are readonly; inherited text styles are built up by spreading.
type TextStyles = {
  -readonly [K in keyof TextStyle]: TextStyle[K];
};
type Theme = React.ContextType<typeof ThemeContext>["theme"];

/**
 * Large documents can exceed 1,000 nodes, so the tree is built by plain
 * functions instead of a component per node, with shared values passed as
 * arguments instead of context reads. Components are only used where hooks
 * are required (state, navigation, gestures, layout).
 *
 * Every container lays its children out as a flow: consecutive inline nodes
 * share one Text and block nodes become Views between them. A View nested in
 * a Text is an inline attachment that ParagraphShadowNode measures once, under
 * the paragraph's width as a maximum, and never lets wrap across lines; flex
 * children collapse to zero under that measurement, which clipped nested lists
 * and quotes to slivers. Superscript is the one deliberate attachment, since
 * an attachment's bottom sits on the baseline and that raises its smaller text.
 *
 * Text styles inherit natively between nested Texts, but not across a View, so
 * each inline element applies only its own style and passes the accumulated
 * styles (`ts`) down for the next root Text (a run, a superscript, a cell).
 */
type RenderContext = {
  theme: Theme;
  s: ThemeStyles;
  onPress?: () => void;
  // Inside a spoiler, links and code keep the spoiler's colors while it's
  // hidden, and superscript attachments paint its background themselves.
  spoiler?: { hidden: boolean; background: ColorValue };
  listDepth: number;
  // List item paragraphs sit on consecutive lines, as on reddit.com.
  tightParagraphs: boolean;
};

const MONOSPACE = Platform.OS === "ios" ? "Menlo" : "monospace";
// U+FE0E keeps the square a text glyph rather than an emoji. Built from code
// points so formatters can't turn the escape into an invisible character.
const BULLETS = ["•", "◦", String.fromCodePoint(0x25aa, 0xfe0e)];
const NO_STYLES: TextStyles = {};
const BOLD: TextStyle = { fontWeight: "bold" };
const ITALIC: TextStyle = { fontStyle: "italic" };
const STRIKE: TextStyle = {
  textDecorationLine: "line-through",
  textDecorationStyle: "solid",
};

function lineHeight(fontSize: number) {
  return Math.floor(fontSize * 1.3);
}

const HEADINGS: Record<string, TextStyle> = {
  h1: { fontSize: 24, lineHeight: lineHeight(24) },
  h2: { fontSize: 22, lineHeight: lineHeight(22) },
  h3: { fontSize: 20, lineHeight: lineHeight(20) },
  h4: { fontSize: 17, lineHeight: lineHeight(17), fontWeight: "bold" },
  h5: { fontSize: 16, lineHeight: lineHeight(16), fontWeight: "bold" },
  h6: { fontSize: 14, lineHeight: lineHeight(14) },
};

function makeThemeStyles(theme: Theme) {
  return {
    baseText: {
      fontSize: 16,
      lineHeight: lineHeight(16),
      color: theme.subtleText,
    },
    marker: { fontSize: 16, lineHeight: lineHeight(16), color: theme.text },
    link: { color: theme.iconOrTextButton },
    // divider, not tint, so code stays visible inside tinted quotes.
    code: {
      fontFamily: MONOSPACE,
      fontSize: 14,
      backgroundColor: theme.divider,
    },
    hiddenCode: { fontFamily: MONOSPACE, fontSize: 14 },
    pre: { backgroundColor: theme.tint, borderColor: theme.divider },
    preText: {
      fontFamily: MONOSPACE,
      fontSize: 14,
      lineHeight: 19,
      color: theme.text,
    },
    blockquoteLTR: {
      backgroundColor: theme.tint,
      borderLeftColor: theme.subtleText,
    },
    blockquoteRTL: {
      backgroundColor: theme.tint,
      borderRightColor: theme.subtleText,
    },
    hr: { borderBottomColor: theme.tint },
    tableCell: { borderColor: theme.tint },
  } satisfies Record<string, TextStyle | ViewStyle>;
}
type ThemeStyles = ReturnType<typeof makeThemeStyles>;

// Shared by every RenderHtml instance using the same theme.
const themeStylesCache = new WeakMap<Theme, ThemeStyles>();
function getThemeStyles(theme: Theme): ThemeStyles {
  let themeStyles = themeStylesCache.get(theme);
  if (!themeStyles) {
    themeStyles = makeThemeStyles(theme);
    themeStylesCache.set(theme, themeStyles);
  }
  return themeStyles;
}

function rootTextStyle(ts: TextStyles, ctx: RenderContext) {
  return ts === NO_STYLES ? ctx.s.baseText : [ctx.s.baseText, ts];
}

const DIRECTIONAL_BLOCK_ELEMENTS = new Set(
  "p h1 h2 h3 h4 h5 h6 li blockquote".split(" "),
);
const BLOCK_ELEMENTS = new Set([
  ...DIRECTIONAL_BLOCK_ELEMENTS,
  ..."div ul ol pre table hr img".split(" "),
]);

/**
 * Like dir="auto" in HTML, a block's direction comes from its first strongly
 * directional character. Walking stops as soon as one is found, so this is
 * cheap even for long paragraphs.
 */
function getNodeDirection(node: AnyNode): TextDirection | null {
  if (node instanceof TextNode) {
    return getTextDirection(node.data);
  }
  if (node instanceof ElementNode) {
    for (const child of node.children) {
      const direction = getNodeDirection(child);
      if (direction) return direction;
    }
  }
  return null;
}

function withDirection(element: ElementNode, ts: TextStyles): TextStyles {
  const direction = getNodeDirection(element);
  return direction && direction !== (ts.writingDirection ?? "ltr")
    ? {
        ...ts,
        writingDirection: direction,
        textAlign: direction === "rtl" ? "right" : "left",
      }
    : ts;
}

function textContent(node: AnyNode): string {
  if (node instanceof TextNode) return node.data;
  if (node instanceof ElementNode)
    return node.children.map(textContent).join("");
  return "";
}

function isGiphyLink(element: ElementNode) {
  return !!element.attribs.href?.includes("giphy.com");
}

function isInlineVideoLink(element: ElementNode) {
  return !!element.attribs.href?.match(/.+\/link\/.+\/video\/.+\/player/);
}

function isImageWrapperLink(element: ElementNode) {
  const child = element.children[0];
  return child instanceof ElementNode && child.name === "img";
}

/**
 * <p> tags are normally rendered as a Text component. However,
 * Reddit sends inline images as <p> tags with an <a> tag inside
 * with the <a> tag containing a link to an image. When that happens,
 * instead of rendering the <p> tag as a Text component, we have to
 * render it as an ImageViewer component. This is because rendering
 * a TouchableOpacity component inside a Text component breaks touches.
 */
function isElementImgLinkInParagraph(element: ElementNode): boolean {
  const child = element.children[0] as ElementNode | undefined;
  return !!(
    element.name === "p" &&
    child?.name === "a" &&
    child?.children[0]?.type === ElementType.Text &&
    child?.attribs.href &&
    RedditURL.getPageType(child?.attribs.href) === PageType.IMAGE
  );
}

function isBlockNode(node: AnyNode | string): boolean {
  if (!(node instanceof ElementNode)) return false;
  if (BLOCK_ELEMENTS.has(node.name) || node.attribs.header) return true;
  return (
    node.name === "a" &&
    (isGiphyLink(node) || isInlineVideoLink(node) || isImageWrapperLink(node))
  );
}

function hasThemeImport(node: AnyNode): node is TextNode {
  return (
    node instanceof TextNode && node.data.includes(CUSTOM_THEME_IMPORT_PREFIX)
  );
}

// Whitespace and comments, which render nothing.
function isBlank(node: AnyNode | string) {
  if (typeof node === "string") return !node.trim();
  if (node instanceof TextNode) return !node.data.trim();
  return !(node instanceof ElementNode);
}

/**
 * Text's onPress uses the JS responder system, which native RNGH buttons
 * (like the Touchable comment rows) swallow before it can fire, so pressable
 * HTML elements use a VirtualGestureDetector tap instead. Native code decides
 * whether a touch belongs to the detector by comparing the tag of the touched
 * text fragment against the tag of the Text the detector wraps, and fragments
 * are tagged with their INNERMOST enclosing Text. So every string under a
 * pressable element gets its own Text, and pressable ancestors (links,
 * spoilers) thread their handler down to those strings via
 * RenderContext.onPress. VirtualGestureDetector only functions under an
 * InterceptingGestureDetector, which RenderHtml provides at its root.
 */
function TappableText({
  onPress,
  ...props
}: Omit<TextProps, "onPress"> & { onPress: () => void }) {
  const tapGesture = useTapGesture({
    // The press handlers do JS work (navigation, state), so keep the callback
    // on the JS thread. Without this the callback is auto-workletized and runs
    // on the UI runtime, where calling onPress throws a Worklets remote
    // function error.
    disableReanimated: true,
    onActivate: () => onPress(),
  });

  return (
    <VirtualGestureDetector gesture={tapGesture}>
      <Text {...props} />
    </VirtualGestureDetector>
  );
}

/**
 * Used for inline videos in comments. Example comment:
 * https://www.reddit.com/r/shittymoviedetails/comments/1udv3qt/comment/otfgauq/
 */
function InlineVideo({ videoId }: { videoId: string }) {
  const { theme } = useContext(ThemeContext);
  const { displayMedia } = useContext(MediaViewerContext);

  const videoURL = `https://v.redd.it/${videoId}/HLSPlaylist.m3u8`;

  return (
    <Touchable
      style={{
        height: 150,
        width: 200,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.tint,
      }}
      onPress={() => {
        displayMedia({
          media: [
            [
              {
                type: "video",
                source: {
                  source: videoURL,
                  hasAudio: false,
                },
              },
            ],
          ],
        });
      }}
    >
      <View>
        <AntDesign name="play-circle" size={32} color="white" />
      </View>
    </Touchable>
  );
}

type TableRow = { cells: ElementNode[]; header: boolean };

function collectTableRows(
  element: ElementNode,
  header: boolean,
  rows: TableRow[],
): TableRow[] {
  for (const child of element.children) {
    if (!(child instanceof ElementNode)) continue;
    if (child.name === "tr") {
      rows.push({
        header,
        cells: child.children.filter(
          (cell): cell is ElementNode =>
            cell instanceof ElementNode &&
            (cell.name === "th" || cell.name === "td"),
        ),
      });
    } else if (["thead", "tbody", "tfoot"].includes(child.name)) {
      collectTableRows(child, header || child.name === "thead", rows);
    }
  }
  return rows;
}

const CELL_CHROME = 2 * 6 + 2 + 4; // padding, borders, rounding slack
const MIN_COLUMN_WIDTH = 80;
const MAX_COLUMN_WEIGHT = 360;

/**
 * Columns are sized to their content like an HTML table, estimated from
 * character counts so no measuring pass is needed. Underestimates only cost
 * an extra wrapped line. When the natural widths don't fit, space is shared
 * in proportion to them, capped so one long column can't starve the rest.
 */
function getColumnWidths(rows: TableRow[], available: number): number[] {
  const natural: number[] = [];
  for (const row of rows) {
    row.cells.forEach((cell, c) => {
      const charWidth = row.header || cell.name === "th" ? 10 : 9;
      const width = textContent(cell).length * charWidth + CELL_CHROME;
      natural[c] = Math.max(natural[c] ?? MIN_COLUMN_WIDTH, width);
    });
  }
  const total = natural.reduce((sum, width) => sum + width, 0);
  if (total <= available) return natural;
  const weights = natural.map((width) => Math.min(width, MAX_COLUMN_WEIGHT));
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  return natural.map((width, c) =>
    Math.max(
      MIN_COLUMN_WIDTH,
      Math.min(width, (available * weights[c]) / weightTotal),
    ),
  );
}

// Only tables subscribe to the frame and measure, so a resize doesn't re-render every comment.
function TableBlock({
  element,
  ts,
  ctx,
}: {
  element: ElementNode;
  ts: TextStyles;
  ctx: RenderContext;
}) {
  const { width: frameWidth } = useSafeAreaFrame();
  const [measuredWidth, setMeasuredWidth] = useState<number>();
  const rows = useMemo(() => collectTableRows(element, false, []), [element]);
  const columnWidths = useMemo(
    () => getColumnWidths(rows, measuredWidth ?? frameWidth - 30),
    [rows, measuredWidth, frameWidth],
  );

  return (
    <ScrollView
      horizontal
      style={styles.table}
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        if (Math.abs(width - (measuredWidth ?? 0)) > 1) setMeasuredWidth(width);
      }}
    >
      <View>
        {rows.map((row, r) => (
          <View key={r} style={styles.tableRow}>
            {row.cells.map((cell, c) => {
              const align = cell.attribs.align as TextStyle["textAlign"];
              const cellTs: TextStyles = {
                ...ts,
                ...(row.header || cell.name === "th" ? BOLD : null),
                ...(align ? { textAlign: align } : null),
              };
              return (
                <View
                  key={c}
                  style={[
                    styles.tableCell,
                    ctx.s.tableCell,
                    { width: columnWidths[c] },
                  ]}
                >
                  {renderFlow(cell.children, cellTs, ctx)}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SpoilerText({
  element,
  ts,
  ctx,
}: {
  element: ElementNode;
  ts: TextStyles;
  ctx: RenderContext;
}) {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const { theme } = ctx;
  // verySubtleText reads as a spoiler block on the background and on tints.
  const color = showSpoiler ? theme.subtleText : theme.verySubtleText;
  const background = showSpoiler ? theme.divider : theme.verySubtleText;

  return (
    <Text style={{ color, backgroundColor: background }}>
      {renderInlineNodes(
        element.children,
        { ...ts, color },
        {
          ...ctx,
          onPress: () => setShowSpoiler(!showSpoiler),
          spoiler: { hidden: !showSpoiler, background },
        },
      )}
    </Text>
  );
}

function RedditLink({
  element,
  ts,
  ctx,
}: {
  element: ElementNode;
  ts: TextStyles;
  ctx: RenderContext;
}) {
  const { pushURL } = useURLNavigation();
  // A tap on a hidden spoiler's link reveals the spoiler instead of navigating.
  const hidden = !!ctx.spoiler?.hidden;

  const onPress = () => {
    const url = element.attribs.href;
    try {
      const redditURL = new RedditURL(url);
      if (redditURL.getPageType() === PageType.UNKNOWN) {
        throw Error("Unknown page type");
      } else {
        pushURL(new RedditURL(url).toString());
      }
    } catch {
      /**
       * We shouldn't need to do this. Reddit's conversion of raw text
       * URLs to HTML is broken. For more info:
       *
       * https://www.reddit.com/r/test/comments/1t1yzu9/underscore_link_test/
       * https://www.reddit.com/r/HydraClient/comments/1svzldz/comment/ojk7jv0/
       */
      const repairedURL = url.replaceAll("%5C", "");
      openExternalLink(repairedURL);
    }
  };

  return (
    <Text style={hidden ? undefined : ctx.s.link}>
      {renderInlineNodes(
        element.children,
        hidden ? ts : { ...ts, color: ctx.theme.iconOrTextButton },
        hidden ? ctx : { ...ctx, onPress },
      )}
    </Text>
  );
}

function renderInlineNodes(
  nodes: (AnyNode | string)[],
  ts: TextStyles,
  ctx: RenderContext,
): React.ReactNode[] {
  return nodes.map((node, i) => renderInline(node, i, nodes[i - 1], ts, ctx));
}

function renderThemeImports(text: string, key: React.Key) {
  const { customThemes, remainingText } = extractThemeFromText(text);
  return (
    <React.Fragment key={key}>
      {remainingText}
      {customThemes.map((customTheme, idx) => (
        <ThemeImport key={idx} customTheme={customTheme} />
      ))}
    </React.Fragment>
  );
}

/** Renders a node that is inside a Text. */
function renderInline(
  node: AnyNode | string,
  key: number,
  previous: AnyNode | string | undefined,
  ts: TextStyles,
  ctx: RenderContext,
): React.ReactNode {
  if (typeof node === "string" || node instanceof TextNode) {
    let text = typeof node === "string" ? node : node.data;
    // HTML whitespace: Snudown puts a newline after each <br/> and between tags.
    if (text.includes("\n")) text = text.replace(/[ \t]*\n[ \t]*/g, " ");
    if (previous instanceof ElementNode && previous.name === "br") {
      text = text.trimStart();
    }
    if (text.includes(CUSTOM_THEME_IMPORT_PREFIX)) {
      return renderThemeImports(text, key);
    }
    return ctx.onPress ? (
      <TappableText key={key} onPress={ctx.onPress}>
        {text}
      </TappableText>
    ) : (
      text
    );
  }
  if (!(node instanceof ElementNode)) return null;
  if (isBlockNode(node)) {
    // Only reachable for blocks nested in inline elements; renders as an attachment.
    return renderBlock(node, key, ts, ctx);
  }

  let formatStyle: TextStyle | null = null;
  switch (node.name) {
    case "br":
      return "\n";
    case "strong":
    case "b":
      formatStyle = BOLD;
      break;
    case "em":
    case "i":
      formatStyle = ITALIC;
      break;
    case "del":
    case "s":
    case "strike":
      formatStyle = STRIKE;
      break;
    case "code": {
      const codeStyle = ctx.spoiler?.hidden ? ctx.s.hiddenCode : ctx.s.code;
      return (
        <Text
          key={key}
          style={
            ts.fontSize
              ? [codeStyle, { fontSize: Math.round(ts.fontSize * 0.875) }]
              : codeStyle
          }
        >
          {renderInlineNodes(node.children, ts, ctx)}
        </Text>
      );
    }
    case "a":
      return <RedditLink key={key} element={node} ts={ts} ctx={ctx} />;
    case "sup": {
      const supTs = { ...ts, fontSize: 11 };
      return (
        <View
          key={key}
          style={
            ctx.spoiler ? { backgroundColor: ctx.spoiler.background } : null
          }
        >
          <Text style={rootTextStyle(supTs, ctx)}>
            {renderInlineNodes(node.children, supTs, ctx)}
          </Text>
        </View>
      );
    }
    case "span":
      if (node.attribs.class === "md-spoiler-text") {
        return <SpoilerText key={key} element={node} ts={ts} ctx={ctx} />;
      }
      break;
  }

  return formatStyle ? (
    <Text key={key} style={formatStyle}>
      {renderInlineNodes(node.children, { ...ts, ...formatStyle }, ctx)}
    </Text>
  ) : (
    <React.Fragment key={key}>
      {renderInlineNodes(node.children, ts, ctx)}
    </React.Fragment>
  );
}

/** Renders children of a View: inline runs become Texts between blocks. */
function renderFlow(
  nodes: AnyNode[],
  ts: TextStyles,
  ctx: RenderContext,
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let run: (AnyNode | string)[] = [];
  let runStart = 0;
  const flush = () => {
    if (run.some((node) => !isBlank(node))) {
      out.push(
        <Text key={`r${runStart}`} style={rootTextStyle(ts, ctx)}>
          {renderInlineNodes(run, ts, ctx)}
        </Text>,
      );
    }
    run = [];
  };

  nodes.forEach((node, i) => {
    if (isBlockNode(node)) {
      flush();
      out.push(renderBlock(node as ElementNode, i, ts, ctx));
    } else if (hasThemeImport(node)) {
      // Theme cards are blocks, so they split the run they appear in.
      const { customThemes, remainingText } = extractThemeFromText(node.data);
      if (!run.length) runStart = i;
      run.push(remainingText);
      flush();
      customThemes.forEach((customTheme, idx) =>
        out.push(
          <ThemeImport key={`t${i}:${idx}`} customTheme={customTheme} />,
        ),
      );
    } else {
      if (!run.length) runStart = i;
      run.push(node);
    }
  });
  flush();
  return out;
}

/** A Text when every child is inline (the common case), else a View flow. */
function renderTextBlock(
  nodes: AnyNode[],
  key: React.Key,
  ts: TextStyles,
  ctx: RenderContext,
  blockStyle?: StyleProp<ViewStyle>,
) {
  const allInline = nodes.every(
    (node) => !isBlockNode(node) && !hasThemeImport(node),
  );
  return allInline ? (
    <Text key={key} style={[rootTextStyle(ts, ctx), blockStyle as TextStyle]}>
      {renderInlineNodes(nodes, ts, ctx)}
    </Text>
  ) : (
    <View key={key} style={blockStyle}>
      {renderFlow(nodes, ts, ctx)}
    </View>
  );
}

function renderListItem(
  element: ElementNode,
  key: React.Key,
  index: number,
  ordered: boolean,
  parentTs: TextStyles,
  ctx: RenderContext,
) {
  const ts = withDirection(element, parentTs);
  const isRTL = ts.writingDirection === "rtl";
  const marker = ordered
    ? `${index + 1}. `
    : `${BULLETS[(ctx.listDepth - 1) % BULLETS.length]} `;
  return (
    <View
      key={key}
      style={[styles.liContainer, isRTL && styles.liContainerRTL]}
    >
      <View style={isRTL ? styles.liIconContainerRTL : styles.liIconContainer}>
        <Text style={[ctx.s.marker, { writingDirection: ts.writingDirection }]}>
          {marker}
        </Text>
      </View>
      <View style={styles.liChildrenContainer}>
        {renderFlow(element.children, ts, ctx)}
      </View>
    </View>
  );
}

function renderList(
  element: ElementNode,
  key: React.Key,
  ts: TextStyles,
  ctx: RenderContext,
) {
  const ordered = element.name === "ol";
  const itemCtx: RenderContext = {
    ...ctx,
    listDepth: ctx.listDepth + 1,
    tightParagraphs: true,
  };
  let index = 0;
  return (
    <View key={key} style={ctx.listDepth === 0 ? styles.list : null}>
      {element.children.map((child, i) =>
        child instanceof ElementNode && child.name === "li" ? (
          renderListItem(child, i, index++, ordered, ts, itemCtx)
        ) : isBlank(child) ? null : (
          <React.Fragment key={i}>
            {renderFlow([child], ts, ctx)}
          </React.Fragment>
        ),
      )}
    </View>
  );
}

/** Renders a block node as a View (or a block-level Text). */
function renderBlock(
  element: ElementNode,
  key: React.Key,
  parentTs: TextStyles,
  ctx: RenderContext,
): React.ReactNode {
  const ts = DIRECTIONAL_BLOCK_ELEMENTS.has(element.name)
    ? withDirection(element, parentTs)
    : parentTs;
  const isRTL = ts.writingDirection === "rtl";

  switch (element.name) {
    case "p":
      if (isElementImgLinkInParagraph(element)) {
        const imgURL = (element.children[0] as ElementNode)?.attribs.href;
        return (
          <View key={key} style={styles.imageContainer}>
            <ImageViewer images={[imgURL]} aspectRatio={16 / 9} />
          </View>
        );
      }
      return renderTextBlock(
        element.children,
        key,
        ts,
        ctx,
        ctx.tightParagraphs ? undefined : styles.paragraph,
      );
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return renderTextBlock(
        element.children,
        key,
        { ...ts, ...HEADINGS[element.name] },
        ctx,
        styles.heading,
      );
    case "blockquote":
      return (
        <View
          key={key}
          style={[
            styles.blockquote,
            isRTL ? styles.blockquoteRTL : styles.blockquoteLTR,
            isRTL ? ctx.s.blockquoteRTL : ctx.s.blockquoteLTR,
          ]}
        >
          {renderFlow(
            element.children,
            ts,
            ctx.tightParagraphs ? { ...ctx, tightParagraphs: false } : ctx,
          )}
        </View>
      );
    case "ul":
    case "ol":
      return renderList(element, key, ts, ctx);
    case "li":
      return renderListItem(element, key, 0, false, ts, {
        ...ctx,
        listDepth: ctx.listDepth + 1,
        tightParagraphs: true,
      });
    case "pre":
      return (
        <ScrollView key={key} horizontal style={[styles.pre, ctx.s.pre]}>
          <View onStartShouldSetResponder={() => true}>
            <Text style={ctx.s.preText}>
              {textContent(element).replace(/\n$/, "")}
            </Text>
          </View>
        </ScrollView>
      );
    case "table":
      return <TableBlock key={key} element={element} ts={ts} ctx={ctx} />;
    case "hr":
      return <View key={key} style={[styles.hr, ctx.s.hr]} />;
    case "img":
      return (
        <View key={key} onStartShouldSetResponder={() => true}>
          <View style={styles.imageContainer}>
            <ImageViewer images={[element.attribs.src]} aspectRatio={16 / 9} />
          </View>
        </View>
      );
    case "div":
      return (
        <View key={key} style={styles.div}>
          {renderFlow(element.children, ts, ctx)}
        </View>
      );
    case "a":
      if (isGiphyLink(element)) {
        const imageId = new URL(element.attribs.href)
          .getBasePath()
          .toString()
          .split("/")[4];
        return (
          <View key={key} style={styles.imageContainer}>
            <ImageViewer
              images={[`https://i.giphy.com/${imageId}.webp`]}
              aspectRatio={16 / 9}
            />
          </View>
        );
      }
      if (isInlineVideoLink(element)) {
        const videoId = element.attribs.href.match(
          /\/link\/[^/]+\/video\/([^/]+)/,
        )?.[1];
        return <InlineVideo key={key} videoId={videoId ?? ""} />;
      }
      return (
        <View key={key} style={styles.imageLink}>
          {renderFlow(element.children, ts, ctx)}
        </View>
      );
  }

  // Elements with a header attribute.
  return renderTextBlock(
    element.children,
    key,
    { ...ts, ...HEADINGS.h1 },
    ctx,
    styles.heading,
  );
}

function RenderHtml({ html }: { html: string }) {
  const { theme } = useContext(ThemeContext);
  const document = useMemo(() => parseDocument(html), [html]);
  const ctx: RenderContext = {
    theme,
    s: getThemeStyles(theme),
    listDepth: 0,
    tightParagraphs: false,
  };
  return (
    <InterceptingGestureDetector>
      <View style={styles.root}>
        {renderFlow(document.children, NO_STYLES, ctx)}
      </View>
    </InterceptingGestureDetector>
  );
}

/**
 * Re-rendering a large document costs 100ms+ of JS time, so a parent
 * re-render (e.g. new comments arriving) must not cascade into mounted
 * instances. html is the only prop, so memo skips the whole tree whenever
 * the source string is unchanged.
 */
export default React.memo(RenderHtml);

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  div: {
    marginVertical: 5,
  },
  paragraph: {
    marginVertical: 5,
  },
  heading: {
    marginTop: 8,
    marginBottom: 4,
  },
  blockquote: {
    marginVertical: 5,
  },
  blockquoteLTR: {
    marginLeft: 5,
    borderLeftWidth: 2,
    paddingLeft: 8,
  },
  blockquoteRTL: {
    marginRight: 5,
    borderRightWidth: 2,
    paddingRight: 8,
  },
  list: {
    marginVertical: 5,
  },
  liContainer: {
    flexDirection: "row",
    marginVertical: 3,
  },
  liContainerRTL: {
    flexDirection: "row-reverse",
  },
  liIconContainer: {
    marginLeft: 5,
  },
  liIconContainerRTL: {
    marginRight: 5,
  },
  liChildrenContainer: {
    flex: 1,
  },
  pre: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  hr: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  table: {
    maxWidth: "100%",
    marginVertical: 5,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    justifyContent: "center",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  imageLink: {
    minWidth: "100%",
  },
  imageContainer: {
    height: 150,
    width: 200,
  },
});
