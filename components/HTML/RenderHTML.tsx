import { AnyNode, Text as TextNode, Element as ElementNode } from "domhandler";
import * as WebBrowser from "expo-web-browser";
import { parseDocument, ElementType } from "htmlparser2";
import React, { useContext, useState } from "react";
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
  ViewProps,
  ViewStyle,
  TouchableOpacity,
  Alert
} from "react-native";

import { ThemeContext, saveCustomTheme, t } from "../../contexts/SettingsContexts/ThemeContext";
import RedditURL, { PageType } from "../../utils/RedditURL";
import { useURLNavigation } from "../../utils/navigation";
import ImageViewer from "../RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageViewer";
import ThemeRow from "../UI/ThemeRow";
import KeyStore from "../../utils/KeyStore";
import { useSetTheme } from "../RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageView/hooks/useSetTheme";
import { CUSTOM_THEME_IMPORT_PREFIX, CUSTOM_THEME_IMPORT_REGEX } from "../../constants/Themes";
const SCREEN_WIDTH = Dimensions.get("screen").width;

type InheritedStyles = ViewStyle & TextStyle;

function lineHeight(fontSize: number) {
  return Math.floor(fontSize * 1.3);
}

type ElementProps = {
  element: ElementNode;
  index: number;
  inheritedStyles: InheritedStyles;
};

function makeChildNodeKey(node: AnyNode, index: number): string {
  if (node instanceof TextNode) {
    return index + node.data + node.nodeValue;
  }
  if (node instanceof ElementNode) {
    return index + node.type + node.name;
  }
  return (
    index +
    node.type +
    (node.sourceCodeLocation?.startOffset?.toString() ?? "") +
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

export function Element({ element, index, inheritedStyles }: ElementProps) {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  const [showSpoiler, setShowSpoiler] = useState(false);

  let Wrapper = View as React.ElementType;
  const wrapperProps: ViewProps & TextProps & ScrollViewProps = {};
  const wrapperStyles: ViewStyle & TextStyle = {};

  // @ts-expect-error index is not typed
  element.index = index;
  if (element.attribs.class === "md-spoiler-text") {
    Wrapper = Text;
    inheritedStyles.color = showSpoiler ? theme.subtleText : theme.tint;
    wrapperStyles.paddingVertical = 2;
    wrapperStyles.paddingHorizontal = 5;
    wrapperStyles.backgroundColor = theme.tint;
    wrapperProps.onPress = () => setShowSpoiler(!showSpoiler);
  } else if (element.attribs.header) {
    Wrapper = Text;
    inheritedStyles.fontSize = 24;
    inheritedStyles.marginTop = 10;
    inheritedStyles.marginBottom = 4;
  } else if (element.name === "div") {
    Wrapper = View;
    wrapperStyles.marginVertical = 5;
  } else if (element.name === "pre") {
    Wrapper = (props) => (
      <ScrollView {...{ ...props, children: null }} horizontal>
        <View onStartShouldSetResponder={() => true}>{props.children}</View>
      </ScrollView>
    );
    wrapperStyles.padding = 10;
    wrapperStyles.backgroundColor = theme.tint;
  } else if (isElementImgLinkInParagraph(element)) {
    const imgURL = (element.children[0] as ElementNode)?.attribs.href;
    Wrapper = () => (
      <View style={styles.imageContainer}>
        <ImageViewer images={[imgURL]} aspectRatio={16 / 9} />
      </View>
    );
    wrapperStyles.marginVertical = 10;
    inheritedStyles.textAlign = "center";
  } else if (element.name === "p") {
    Wrapper = Text;
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
    Wrapper = (props) => (
      <ScrollView
        {...{ ...props, children: null }}
        horizontal
        style={{
          maxWidth: "100%",
          marginVertical: 5,
        }}
      >
        <View onStartShouldSetResponder={() => true}>{props.children}</View>
      </ScrollView>
    );
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
    element.children[0]?.type === ElementType.Text
  ) {
    Wrapper = Text;
    inheritedStyles.color = theme.iconOrTextButton;
    wrapperProps.onPress = () => {
      const url = element.attribs.href;
      try {
        const redditURL = new RedditURL(url);
        if (redditURL.getPageType() === PageType.UNKNOWN) {
          throw Error("Unknown page type");
        } else {
          pushURL(new RedditURL(url).toString());
        }
      } catch {
        WebBrowser.openBrowserAsync(element.attribs.href);
      }
    };
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
    Wrapper = (props) => (
      <View style={styles.liContainer}>
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
          <Text>{props.children}</Text>
        </View>
      </View>
    );
  } else if (element.name === "img") {
    Wrapper = (props) => (
      <View onStartShouldSetResponder={() => true}>
        <View style={styles.imageContainer}>
          <ImageViewer images={[element.attribs.src]} />
        </View>
        <View>{props.children}</View>
      </View>
    );
    wrapperStyles.marginVertical = 10;
    inheritedStyles.textAlign = "center";
  }

  return Wrapper !== null ? (
    <Wrapper
      key={index}
      style={{
        ...inheritedStyles,
        ...wrapperStyles,
      }}
      {...wrapperProps}
    >
      {element.children
        .filter(
          (c: any) =>
            !(
              typeof c.data === "string" &&
              (c.data === "\n" || c.data === "\n\n")
            ),
        )
        .map((c, i) => (
          <Node
            key={makeChildNodeKey(c, i)}
            node={c}
            index={i}
            inheritedStyles={inheritedStyles}
          />
        ))}
    </Wrapper>
  ) : null;
}

type TextNodeProps = {
  textNode: TextNode;
  index: number;
  inheritedStyles: InheritedStyles;
};

export function TextNodeElem({
  textNode,
  inheritedStyles,
}: TextNodeProps) {
  const setTheme = useSetTheme();
  const { theme } = useContext(ThemeContext);

  const makeOnPress = (themeData: any) => () =>
    Alert.alert(
      "Import Theme",
      `Import "${themeData.name}" to your custom themes?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: () => {
            try {
              saveCustomTheme(themeData);
              Alert.alert("Imported", `"${themeData.name}" saved.`);
            } catch {
              Alert.alert("Error", "Failed to save theme.");
            }
          },
        },
        {
          text: "Import & Apply",
          onPress: () => {
            try {
              saveCustomTheme(themeData);
              setTheme?.(`${themeData.name}`, true);
            } catch {
              Alert.alert("Error", "Failed to apply theme.");
            }
          },
        },
      ]
    );

  const segments = textNode.data.split(CUSTOM_THEME_IMPORT_REGEX);

  return (
    <>
      {segments.map((segment, idx) => {
        if (!segment.startsWith(CUSTOM_THEME_IMPORT_PREFIX)) {
          return <Text key={idx} style={t(styles.basicText, { color: theme.subtleText, ...inheritedStyles })}>{segment}</Text>;
        }
        const jsonPart = segment.slice(CUSTOM_THEME_IMPORT_PREFIX.length);
        try {
          const themeData = JSON.parse(jsonPart);
          return (
            <ThemeRow
              key={idx}
              theme={themeData}
              onPress={makeOnPress(themeData)}
            />
          );
        } catch {
          return (
            <Text key={idx} style={{ color: "red" }}>
              {segment}
            </Text>
          );
        }
      })}
    </>
  );
}

type NodeProps = {
  node: AnyNode;
  index: number;
  inheritedStyles: InheritedStyles;
};

export function Node({ node, index, inheritedStyles }: NodeProps) {
  switch (node.type) {
    case ElementType.Text:
      return (
        <TextNodeElem
          textNode={node}
          index={index}
          inheritedStyles={{ ...inheritedStyles }}
        />
      );
    case ElementType.Tag:
      return (
        <Element
          element={node}
          index={index}
          inheritedStyles={{ ...inheritedStyles }}
        />
      );
  }
  return null;
}

export default function RenderHtml({ html }: { html: string }) {
  const document = parseDocument(html);
  return (
    <View>
      {document.children.map((c, i) => (
        <Node
          key={makeChildNodeKey(c, i)}
          node={c}
          index={i}
          inheritedStyles={{}}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  basicText: {
    fontSize: 16,
    lineHeight: lineHeight(16),
    marginVertical: 5,
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
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  name: {
    width: 100,
    fontSize: 18,
    marginRight: 15,
  },
  swatches: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
  },
  swatch: {
    flex: 1,
    height: 20,
  },
  icon: {
    width: 30,
    alignItems: "flex-end",
  },
});
