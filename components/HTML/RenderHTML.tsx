import { AnyNode, Text as TextNode, Element as ElementNode } from "domhandler";
import { openExternalLink } from "../../utils/openExternalLink";
import { parseDocument, ElementType } from "htmlparser2";
import React, { useContext, useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  ScrollViewProps,
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
import URL from "../../utils/URL";
import { TextWithRepairedHeight } from "../Other/TextWithRepairedHeight";
import {
  InterceptingGestureDetector,
  Touchable,
  useTapGesture,
  VirtualGestureDetector,
} from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import { MediaViewerContext } from "../../contexts/MediaViewerContext";
const SCREEN_WIDTH = Dimensions.get("screen").width;

type InheritedStyles = ViewStyle & TextStyle;

/**
 * Large documents can exceed 1,000 nodes, so the tree is built by plain
 * functions instead of a component per node, with shared values passed as
 * arguments instead of context reads. Components are only used where hooks
 * are required (state, navigation, gestures).
 */
type RenderContext = {
  theme: React.ContextType<typeof ThemeContext>["theme"];
  onPress?: () => void;
};

function lineHeight(fontSize: number) {
  return Math.floor(fontSize * 1.3);
}

function makeChildNodeKey(node: AnyNode, index: number): string {
  if (node instanceof TextNode) {
    return index + ":" + node.data;
  }
  if (node instanceof ElementNode) {
    return index + ":" + node.type + ":" + node.name;
  }
  return (
    index +
    ":" +
    node.type +
    ":" +
    (node.sourceCodeLocation?.startOffset?.toString() ?? "") +
    ":" +
    (node.sourceCodeLocation?.endOffset?.toString() ?? "")
  );
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

/**
 * Text's onPress uses the JS responder system, which native RNGH buttons
 * (like the Touchable comment rows) swallow before it can fire, so pressable
 * HTML elements use a VirtualGestureDetector tap instead. Native code decides
 * whether a touch belongs to the detector by comparing the tag of the touched
 * text fragment against the tag of the Text the detector wraps, and fragments
 * are tagged with their INNERMOST enclosing Text. Every raw string in this
 * renderer gets its own Text, so the detector must live there — pressable
 * ancestors (links, spoilers) thread their handler down to their text nodes
 * via RenderContext.onPress. VirtualGestureDetector only functions under an
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
                  videoDownloadURL: videoURL,
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

function PreBlock(props: ScrollViewProps) {
  return (
    <ScrollView {...{ ...props, children: null }} horizontal>
      <View onStartShouldSetResponder={() => true}>{props.children}</View>
    </ScrollView>
  );
}

function TableBlock(props: ScrollViewProps) {
  return (
    <ScrollView
      {...{ ...props, children: null }}
      horizontal
      style={{
        maxWidth: "100%",
        marginVertical: 5,
      }}
    >
      <View>{props.children}</View>
    </ScrollView>
  );
}

function SpoilerText({
  element,
  inheritedStyles,
}: {
  element: ElementNode;
  inheritedStyles: InheritedStyles;
}) {
  const { theme } = useContext(ThemeContext);
  const [showSpoiler, setShowSpoiler] = useState(false);

  inheritedStyles.color = showSpoiler ? theme.subtleText : theme.tint;
  return (
    <Text
      style={{
        ...inheritedStyles,
        paddingVertical: 2,
        paddingHorizontal: 5,
        backgroundColor: theme.tint,
      }}
    >
      {renderChildNodes(element, inheritedStyles, {
        theme,
        onPress: () => setShowSpoiler(!showSpoiler),
      })}
    </Text>
  );
}

function RedditLink({
  element,
  inheritedStyles,
}: {
  element: ElementNode;
  inheritedStyles: InheritedStyles;
}) {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  inheritedStyles.color = theme.iconOrTextButton;
  return (
    <Text style={{ ...inheritedStyles }}>
      {renderChildNodes(element, inheritedStyles, {
        theme,
        onPress: () => {
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
        },
      })}
    </Text>
  );
}

function renderChildNodes(
  element: ElementNode,
  inheritedStyles: InheritedStyles,
  ctx: RenderContext,
) {
  return element.children
    .filter(
      (c: any) =>
        !(typeof c.data === "string" && (c.data === "\n" || c.data === "\n\n")),
    )
    .map((c, i) => renderNode(c, i, inheritedStyles, ctx));
}

function renderElement(
  element: ElementNode,
  key: string,
  index: number,
  inheritedStyles: InheritedStyles,
  ctx: RenderContext,
): React.ReactNode {
  const { theme } = ctx;

  let Wrapper = View as React.ElementType;
  const wrapperStyles: ViewStyle & TextStyle = {};

  if (element.attribs.class === "md-spoiler-text") {
    return (
      <SpoilerText
        key={key}
        element={element}
        inheritedStyles={inheritedStyles}
      />
    );
  } else if (element.attribs.header) {
    Wrapper = Text;
    inheritedStyles.fontSize = 24;
    inheritedStyles.marginTop = 10;
    inheritedStyles.marginBottom = 4;
  } else if (element.name === "div") {
    Wrapper = View;
    wrapperStyles.marginVertical = 5;
  } else if (element.name === "pre") {
    Wrapper = PreBlock;
    wrapperStyles.padding = 10;
    wrapperStyles.backgroundColor = theme.tint;
  } else if (isElementImgLinkInParagraph(element)) {
    const imgURL = (element.children[0] as ElementNode)?.attribs.href;
    return (
      <View key={key} style={styles.imageContainer}>
        <ImageViewer images={[imgURL]} aspectRatio={16 / 9} />
      </View>
    );
  } else if (element.name === "p") {
    Wrapper = TextWithRepairedHeight;
    wrapperStyles.marginVertical = 5;
  } else if (element.name === "hr") {
    Wrapper = View;
    wrapperStyles.borderBottomColor = theme.tint;
    wrapperStyles.borderBottomWidth = 1;
    wrapperStyles.marginVertical = 8;
  } else if (element.name === "h1") {
    Wrapper = View;
    inheritedStyles.fontSize = 32;
    inheritedStyles.lineHeight = lineHeight(32);
  } else if (element.name === "h2") {
    Wrapper = View;
    inheritedStyles.fontSize = 24;
    inheritedStyles.lineHeight = lineHeight(24);
  } else if (element.name === "h3") {
    Wrapper = View;
    inheritedStyles.fontSize = 20;
    inheritedStyles.lineHeight = lineHeight(20);
  } else if (element.name === "blockquote") {
    Wrapper = View;
    wrapperStyles.backgroundColor = theme.tint;
    wrapperStyles.marginLeft = 5;
    wrapperStyles.borderLeftColor = theme.subtleText;
    wrapperStyles.borderLeftWidth = 2;
    wrapperStyles.paddingLeft = 8;
    wrapperStyles.marginVertical = 2;
  } else if (element.name === "span") {
    Wrapper = Text;
    wrapperStyles.marginVertical = 5;
  } else if (element.name === "table") {
    Wrapper = TableBlock;
  } else if (element.name === "thead") {
    Wrapper = View;
    wrapperStyles.flexDirection = "column";
    inheritedStyles.fontWeight = "bold";
  } else if (element.name === "tbody") {
    Wrapper = View;
    wrapperStyles.flexDirection = "column";
  } else if (element.name === "tr") {
    Wrapper = View;
    wrapperStyles.flexDirection = "row";
  } else if (["th", "td"].includes(element.name)) {
    Wrapper = View;
    const siblingCount =
      element.parent?.children?.filter((c) => c.type !== "text")?.length ?? 1;
    const availableWidth = (SCREEN_WIDTH - 30) /* padding */ / siblingCount;
    wrapperStyles.flexDirection = "column";
    wrapperStyles.width = siblingCount < 4 ? availableWidth : 100;
    wrapperStyles.borderColor = theme.tint;
    wrapperStyles.borderWidth = 1;
    wrapperStyles.padding = 2;
  } else if (element.name === "strong") {
    Wrapper = Text;
    inheritedStyles.fontWeight = "bold";
  } else if (element.name === "del") {
    Wrapper = Text;
    inheritedStyles.textDecorationLine = "line-through";
    inheritedStyles.textDecorationStyle = "solid";
  } else if (element.name === "code") {
    Wrapper = Text;
    inheritedStyles.color = theme.text;
    inheritedStyles.fontFamily =
      Platform.OS === "ios" ? "Courier New" : "monospace";
    wrapperStyles.backgroundColor = theme.tint;
  } else if (element.name === "sup") {
    Wrapper = View;
    inheritedStyles.marginVertical = 0;
    inheritedStyles.paddingHorizontal = 0;
    inheritedStyles.fontSize = 11;
  } else if (
    element.name === "a" &&
    element.attribs.href?.includes("giphy.com")
  ) {
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
  } else if (
    element.name === "a" &&
    element.attribs.href?.match(/.+\/link\/.+\/video\/.+\/player/)
  ) {
    const videoId = element.attribs.href.match(
      /\/link\/[^/]+\/video\/([^/]+)/,
    )?.[1];
    return <InlineVideo key={key} videoId={videoId ?? ""} />;
  } else if (
    element.name === "a" &&
    element.children[0]?.type === ElementType.Text
  ) {
    return (
      <RedditLink
        key={key}
        element={element}
        inheritedStyles={inheritedStyles}
      />
    );
  } else if (
    element.name === "a" &&
    element.children[0]?.type === ElementType.Tag &&
    element.children[0]?.name === "img"
  ) {
    Wrapper = View;
    wrapperStyles.minWidth = "100%";
  } else if (element.name === "em") {
    Wrapper = Text;
    inheritedStyles.fontStyle = "italic";
  } else if (["ol", "ul"].includes(element.name)) {
    Wrapper = View;
  } else if (element.name === "li") {
    return (
      <View key={key} style={styles.liContainer}>
        <View style={styles.liIconContainer}>
          <Text
            style={{ fontSize: styles.basicText.fontSize, color: theme.text }}
          >
            {(element.parent as ElementNode | null)?.name === "ol"
              ? `${index + 1}. `
              : "• "}
          </Text>
        </View>
        <View style={styles.liChildrenContainer}>
          <Text>{renderChildNodes(element, inheritedStyles, ctx)}</Text>
        </View>
      </View>
    );
  } else if (element.name === "img") {
    inheritedStyles.textAlign = "center";
    return (
      <View key={key} onStartShouldSetResponder={() => true}>
        <View style={styles.imageContainer}>
          <ImageViewer images={[element.attribs.src]} aspectRatio={16 / 9} />
        </View>
        <View>{renderChildNodes(element, inheritedStyles, ctx)}</View>
      </View>
    );
  }

  return (
    <Wrapper
      key={key}
      style={{
        ...inheritedStyles,
        ...wrapperStyles,
      }}
    >
      {renderChildNodes(element, inheritedStyles, ctx)}
    </Wrapper>
  );
}

function renderTextNode(
  textNode: TextNode,
  key: string,
  inheritedStyles: InheritedStyles,
  ctx: RenderContext,
): React.ReactNode {
  /**
   * extractThemeFromText() is not a performance issue. Even on large posts with many
   * nodes, it takes less than a milisecond for the whole thing.
   */
  const { customThemes, remainingText } = extractThemeFromText(textNode.data);

  if (remainingText === "\n\n" || remainingText === "\n") {
    /**
     * This is only used in the guide pages. The new lines get stripped out
     * ahead of time for all markdown coming from Reddit.
     */
    return <View key={key} style={{ height: 10 }} />;
  }

  const textStyle = [
    styles.basicText,
    {
      color: ctx.theme.subtleText,
      ...inheritedStyles,
    },
  ];

  const textElem = ctx.onPress ? (
    <TappableText key={key} onPress={ctx.onPress} style={textStyle}>
      {remainingText}
    </TappableText>
  ) : (
    <Text key={key} style={textStyle}>
      {remainingText}
    </Text>
  );

  return customThemes.length > 0 ? (
    <React.Fragment key={key}>
      {textElem}
      {customThemes.map((customTheme, idx) => (
        <ThemeImport key={idx} customTheme={customTheme} />
      ))}
    </React.Fragment>
  ) : (
    textElem
  );
}

function renderNode(
  node: AnyNode,
  index: number,
  inheritedStyles: InheritedStyles,
  ctx: RenderContext,
): React.ReactNode {
  const key = makeChildNodeKey(node, index);
  switch (node.type) {
    case ElementType.Text:
      return renderTextNode(node, key, { ...inheritedStyles }, ctx);
    case ElementType.Tag:
      return renderElement(node, key, index, { ...inheritedStyles }, ctx);
  }
  return null;
}

function RenderHtml({ html }: { html: string }) {
  const { theme } = useContext(ThemeContext);
  const document = useMemo(() => parseDocument(html), [html]);
  return (
    <InterceptingGestureDetector>
      <View style={{ width: "100%" }}>
        {document.children.map((c, i) => renderNode(c, i, {}, { theme }))}
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
  basicText: {
    fontSize: 16,
    lineHeight: lineHeight(16),
  },
  liContainer: {
    flexDirection: "row",
    marginVertical: 3,
  },
  liIconContainer: {
    marginLeft: 5,
  },
  liChildrenContainer: {
    flex: 1,
  },
  imageContainer: {
    height: 150,
    width: 200,
  },
});
