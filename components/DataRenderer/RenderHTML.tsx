import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { parseDocument, ElementType } from 'htmlparser2';
import React, { ReactElement, ReactNode, useContext } from 'react';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import { AnyNode, Text as TextNode, Element as ElementNode } from 'domhandler';

export default function RenderHtml({ html }: {html: string}) {
    const theme = useContext(ThemeContext);

    const renderTextNode = (textNode: TextNode, index: number) => {
        const parent = textNode.parent as ElementNode;
        const grandParent = parent?.parent as ElementNode;
        const greatGrandParent = grandParent?.parent as ElementNode;
        let text = textNode.data;
        let style: TextStyle = {};
        if (parent?.name === 'strong') {
            style.fontWeight = 'bold';
        }
        if (grandParent.name === 'li') {
            if (greatGrandParent.name === 'ol') {
                // @ts-ignore comment
                text = `${grandParent.index + 1}. ${text}`;
            }
            if (greatGrandParent.name === 'ul') {
                text = `• ${text}`;
            }
        }
        return (
            <Text
                key={index}
                style={t(styles.bodyHTML, {
                    color: theme.subtleText,
                    ...style,
                })}
            >
                {text}
            </Text>
        );
    }

    const renderElement = (element: ElementNode, index: number) => {
        let Wrapper = View as React.ElementType;
        let style: ViewStyle = {};
        // @ts-ignore comment
        element.index = index;
        if (element.name === 'div') {
            Wrapper = View;
            style.marginVertical = 5;
        } else if (element.name === 'p') {
            Wrapper = Text;
            style.marginVertical = 5;
        } else if (element.name === 'strong') {
            Wrapper = Text;
        } else if (['ol', 'ul'].includes(element.name)) {
            Wrapper = View;
            style.marginHorizontal = 10;
        } else if (element.name === 'li') {
            Wrapper = Text;
            style.marginVertical = 5;
        }
        return Wrapper !== null ? (
            <Wrapper
                key={index}
                {...style}
            >
                {element.children.map((c, i) => renderNode(c, i))}
            </Wrapper>
        ) : null
    }

    const renderNode = (node: AnyNode, index: number) => {
        switch (node.type) {
            case ElementType.Text:
                return renderTextNode(node, index);
            case ElementType.Tag:
                return renderElement(node, index);
        }
        return null;
    }


    const document = parseDocument(html);
    return (
        <View>
            {document.children.map((c, i) => renderNode(c, i))}
        </View>
    )
}

const styles = StyleSheet.create({
    bodyHTML: {
      fontSize: 15,
      marginVertical: 10,
      paddingHorizontal: 15,
    },
});