import { Platform, ScrollView, ScrollViewProps, StyleSheet, Text, TextProps, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import { parseDocument, ElementType } from 'htmlparser2';
import React, { useContext, useState } from 'react';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import { AnyNode, Text as TextNode, Element as ElementNode } from 'domhandler';
import * as WebBrowser from 'expo-web-browser';
import ImageViewer from '../RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageViewer';
import RedditURL from '../../utils/RedditURL';
import { HistoryContext } from '../../contexts/HistoryContext';

type InheritedStyles = ViewStyle & TextStyle;

function lineHeight(fontSize: number) {
    return Math.floor(fontSize * 1.3);
}

type ElementProps = {
    element: ElementNode,
    index: number,
    inheritedStyles: InheritedStyles,
}

function makeChildNodeKey(node: AnyNode, index: number): string {
    if (node instanceof TextNode) {
        return (
            index
            + node.data
            + node.nodeValue
        );
    }
    if (node instanceof ElementNode) {
        return (
            index
            + node.type
            + node.name
        );
    }
    return (
        index
        + node.type
        + (node.sourceCodeLocation?.startOffset?.toString() ?? '')
        + (node.sourceCodeLocation?.endOffset?.toString() ?? '')
    );
}

export function Element({ element, index, inheritedStyles }: ElementProps) {
    const { theme } = useContext(ThemeContext);
    const history = useContext(HistoryContext);

    const [showSpoiler, setShowSpoiler] = useState(false);

    let Wrapper = View as React.ElementType;
    let wrapperProps: ViewProps & TextProps & ScrollViewProps = {};
    let wrapperStyles: ViewStyle & TextStyle = {};

    // @ts-ignore comment
    element.index = index;
    if (element.attribs.class === 'md-spoiler-text') {
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
    } else if (element.name === 'div') {
        Wrapper = View;
        wrapperStyles.marginVertical = 5;
    } else if (element.name === 'pre') {
        Wrapper = (props) => (
            <ScrollView {...{ ...props, children: null }} horizontal={true}>
                <View onStartShouldSetResponder={() => true}>
                    {props.children}
                </View>
            </ScrollView>
        );
        wrapperStyles.padding = 10;
        wrapperStyles.backgroundColor = theme.tint;
    } else if (element.name === 'p') {
        Wrapper = Text;
        wrapperStyles.marginVertical = 5;
    } else if (element.name === 'hr') {
        Wrapper = View;
        wrapperStyles.borderBottomColor = theme.tint;
        wrapperStyles.borderBottomWidth = 1;
        wrapperStyles.marginVertical = 8;
    } else if (element.name === 'h1') {
        Wrapper = View;
        inheritedStyles.fontSize = 32;
        inheritedStyles.lineHeight = lineHeight(32);
    } else if (element.name === 'blockquote') {
        Wrapper = View;
        wrapperStyles.backgroundColor = theme.tint;
        wrapperStyles.marginLeft = 5;
        wrapperStyles.borderLeftColor = theme.subtleText;
        wrapperStyles.borderLeftWidth = 2;
        wrapperStyles.paddingLeft = 8;
        wrapperStyles.marginVertical = 2;
    } else if (element.name === 'span') {
        Wrapper = Text;
        wrapperStyles.marginVertical = 5;
    } else if (element.name === 'table') {
        Wrapper = View;
        wrapperStyles.flexDirection = 'column';
        wrapperStyles.margin = 5;
    } else if (element.name === 'thead') {
        Wrapper = View;
        wrapperStyles.flexDirection = 'column'
        inheritedStyles.fontWeight = 'bold';
    } else if (element.name === 'tbody') {
        Wrapper = View;
        wrapperStyles.flexDirection = 'column'
    } else if (element.name === 'tr') {
        Wrapper = View;
        wrapperStyles.flexDirection = 'row'
    } else if (['th', 'td'].includes(element.name)) {
        Wrapper = View;
        wrapperStyles.flexDirection = 'column'
        wrapperStyles.flex = 1;
        wrapperStyles.borderColor = theme.tint;
        wrapperStyles.borderWidth = 1;
    } else if (element.name === 'strong') {
        Wrapper = Text;
        inheritedStyles.fontWeight = 'bold';
    } else if (element.name === 'del') {
        Wrapper = Text;
        inheritedStyles.textDecorationLine = 'line-through';
        inheritedStyles.textDecorationStyle = 'solid';
    } else if (element.name === 'code') {
        Wrapper = Text;
        inheritedStyles.color = theme.text;
        inheritedStyles.fontFamily = Platform.OS === 'ios' ? 'Courier New' : 'monospace';
        wrapperStyles.backgroundColor = theme.tint;
    } else if (element.name === 'sup') {
        Wrapper = View;
        inheritedStyles.marginVertical = 0;
        inheritedStyles.paddingHorizontal = 0;
        inheritedStyles.fontSize = 11;
    } else if (element.name === 'a' && element.children[0]?.type === ElementType.Text) {
        Wrapper = Text;
        inheritedStyles.color = theme.buttonText;
        wrapperProps.onPress = () => {
            const url = element.attribs.href;
            try {
                history.pushPath(new RedditURL(url).toString());
            } catch {
                WebBrowser.openBrowserAsync(element.attribs.href);
            }
        }
    } else if (element.name === 'em') {
        Wrapper = Text;
        inheritedStyles.fontStyle = 'italic';
    } else if (['ol', 'ul'].includes(element.name)) {
        Wrapper = View;
    } else if (element.name === 'img') {
        Wrapper = (props) => (
            <View {...{ ...props, children: null }}>
                <View onStartShouldSetResponder={() => true}>
                    <View style={styles.imageContainer}>
                        <ImageViewer images={[element.attribs.src]}/>
                    </View>
                    <View>
                        {props.children}
                    </View>
                </View>
            </View>
        );
        wrapperStyles.marginVertical = 10;
        inheritedStyles.textAlign = 'center';
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
            {
                element.children
                .filter((c: any) => !(typeof c.data === 'string' && c.data.trim() === ''))
                .map((c, i) =>
                    <Node
                        key={makeChildNodeKey(c, i)}
                        node={c} index={i} inheritedStyles={inheritedStyles}
                    />
                )
            }
        </Wrapper>
    ) : null
}

type TextNodeProps = {
    textNode: TextNode,
    index: number,
    inheritedStyles: InheritedStyles,
}

export function TextNodeElem({ textNode, index, inheritedStyles }: TextNodeProps) {
    const { theme } = useContext(ThemeContext);

    const parent = textNode.parent as ElementNode;
    const grandParent = parent?.parent as ElementNode;
    let text = textNode.data;

    if (parent.name === 'li') {
        if (grandParent.name === 'ol') {
            // @ts-ignore comment
            text = `${parent.index + 1}. ${text}`;
        }
        if (grandParent.name === 'ul') {
            text = `• ${text}`;
        }
    }
    
    return (
        <Text
            key={index}
            style={t(styles.basicText, {
                color: theme.subtleText,
                ...inheritedStyles,
            })}
        >
            {text}
        </Text>
    );
}

type NodeProps = {
    node: AnyNode,
    index: number,
    inheritedStyles: InheritedStyles,
}

export function Node({ node, index, inheritedStyles }: NodeProps) {
    switch (node.type) {
        case ElementType.Text:
            if (node.data.trim() === '') {
                return null;
            }
            return <TextNodeElem textNode={node} index={index} inheritedStyles={{...inheritedStyles}} />;
        case ElementType.Tag:
            return <Element element={node} index={index} inheritedStyles={{...inheritedStyles}} />;
    }
    return null;
}


export default function RenderHtml({ html }: {html: string}) {
    const document = parseDocument(html);
    return (
        <View>
            {document.children.map((c, i) =>
                <Node
                    key={makeChildNodeKey(c, i)}
                    node={c}
                    index={i}
                    inheritedStyles={{}}
                />)}
        </View>
    )
}

const styles = StyleSheet.create({
    basicText: {
      fontSize: 15.5,
      lineHeight: lineHeight(15.5),
      marginVertical: 5,
    },
    imageContainer: {
        height: 200,
    },
});