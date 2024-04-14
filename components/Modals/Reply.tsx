import React, { ReactNode, useContext, useEffect, useRef } from 'react';
import { Share, StyleSheet, View, Text, TouchableOpacity, Dimensions, TextInput, ScrollView, KeyboardAvoidingView, Keyboard, TextInputSelectionChangeEventData, Alert, ActivityIndicator } from 'react-native';
import { ThemeContext, t } from '../../contexts/SettingsContexts/ThemeContext';
import { AntDesign, Entypo, Feather, FontAwesome } from '@expo/vector-icons';
import { AccountContext } from '../../contexts/AccountContext';
import { ModalContext } from '../../contexts/ModalContext';
import { UserContent } from '../../api/User';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Snudown from '../../external/snudown';
import RenderHtml from '../HTML/RenderHTML';
import { submitComment } from '../../api/PostDetail';

type ReplyProps = {
    userContent: UserContent,
    replySent: () => void,
}

const getSelected = (text: string, selection: React.MutableRefObject<TextInputSelectionChangeEventData['selection']>) => {
    return text.slice(selection.current.start, selection.current.end);
}

const replaceText = (
    text: string,
    replacement: string,
    selection: React.MutableRefObject<TextInputSelectionChangeEventData['selection']>
) => {
    return text.slice(0, selection.current.start) + replacement + text.slice(selection.current.end);
}

export default function Reply({ userContent, replySent }: ReplyProps) {
    const { theme } = useContext(ThemeContext);
    const { setModal } = useContext(ModalContext);

    const selection = useRef<TextInputSelectionChangeEventData['selection']>({ start: 0, end: 0 });

    const [text, setText] = React.useState('');
    const [viewMode, setViewMode] = React.useState<'parent' | 'preview'>('parent');
    const [sendingPost, setSendingPost] = React.useState(false);

    return (
        <View style={t(styles.loginSubContainer, {
            backgroundColor: theme.background,
        })}>
            <SafeAreaView style={styles.safeContainers}>
                <KeyboardAvoidingView
                    style={styles.safeContainers}
                    behavior={'padding'}
                >
                    <View style={t(styles.topBar, {
                        borderBottomColor: theme.tint,
                    })}>
                        <TouchableOpacity onPress={() => {
                            setSendingPost(false);
                            setModal(undefined)
                        }}>
                            <Text style={t(styles.topBarButton, {
                                color: theme.buttonText
                            })}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <Text style={t(styles.topBarTitle, {
                            color: theme.text
                        })}>
                            New Comment
                        </Text>
                        {sendingPost ? (
                            <ActivityIndicator size='small' color={theme.buttonText}/>
                        ) : (
                            <TouchableOpacity onPress={async () => {
                                setSendingPost(true);
                                try {
                                    const success = await submitComment(userContent, text);
                                    if (success) {
                                        setTimeout(() => {
                                            replySent();
                                            setModal(undefined);
                                        }, 5000);
                                    } else {
                                        throw new Error('Failed to submit comment');
                                    }
                                } catch {
                                    setSendingPost(false);
                                    Alert.alert('Failed to post comment');
                                }
                            }}>
                                <Text style={t(styles.topBarButton, {
                                    color: theme.buttonText
                                })}>
                                    Post
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <TextInput
                            style={t(styles.textInput, {
                                color: theme.text,
                            })}
                            placeholder='Reply'
                            placeholderTextColor={theme.verySubtleText}
                            multiline={true}
                            numberOfLines={4}
                            value={text}
                            onChangeText={setText}
                            onSelectionChange={({ nativeEvent }) => {
                                selection.current = nativeEvent.selection;
                            }}
                        />
                        <View style={t(styles.previewTypeContainer, {
                            backgroundColor: theme.tint,
                            borderBottomColor: theme.divider,
                        })}>
                            <TouchableOpacity
                                onPress={() => setViewMode('parent')}
                            >
                                <Text style={t(styles.previewTypeText, {
                                    color: theme.text,
                                    borderColor: viewMode === 'parent' ? theme.buttonText : theme.tint,
                                })}>
                                    Parent
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setViewMode('preview')}>
                                <Text style={t(styles.previewTypeText, {
                                    color: theme.text,
                                    borderColor: viewMode === 'preview' ? theme.buttonText : theme.tint,
                                })}>
                                    Preview
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={t(styles.renderHTMLContainer, {
                            backgroundColor: theme.background,
                        })}>
                            <RenderHtml html={viewMode === 'parent' ? userContent.html : Snudown.markdown(text)}/>
                        </View>
                    </ScrollView>
                    <View style={styles.bottomBar}>
                        <TouchableOpacity onPress={() => {
                            const selectedText = getSelected(text, selection);
                            Alert.prompt('URL', undefined, (url: string) => {
                                setText((text) => replaceText(text, `[${selectedText}](${url})`, selection));
                            });
                        }}>
                            <AntDesign name='link' size={24} color={theme.iconPrimary}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            const selectedText = getSelected(text, selection);
                            setText((text) => replaceText(text, `**${selectedText}**`, selection));
                        }}>
                            <FontAwesome name='bold' size={24} color={theme.iconPrimary}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            const selectedText = getSelected(text, selection);
                            setText((text) => replaceText(text, `*${selectedText}*`, selection));
                        }}>
                            <FontAwesome name='italic' size={24} color={theme.iconPrimary}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            if (text === '') {
                                // If no text, add a blockquote
                                setText('> ');
                            } else if (selection.current.start === selection.current.end) {
                                // If no text is selected, add to start of current paragraph
                                for (let i = selection.current.start; i > 0; i--) {
                                    if (text.slice(i - 1, i) === '\n') {
                                        setText((text) => replaceText(
                                            text,
                                            `\n> ${getSelected(text, selection)}`,
                                            { current: { start: i - 1, end: i }}
                                        ));
                                        break;
                                    }
                                }
                            } else {
                                // If text is selected, quote each line
                                setText((text) => {
                                    const selectedText = getSelected(text, selection);
                                    return replaceText(text, selectedText.split('\n').map((line) => `> ${line}`).join('\n'), selection);
                                });
                            }
                        }}>
                            <Entypo name='quote' size={24} color={theme.iconPrimary}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            const selectedText = getSelected(text, selection);
                            setText((text) => replaceText(text, `~~${selectedText}~~`, selection));
                        }}>
                            <FontAwesome name='strikethrough' size={24} color={theme.iconPrimary}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            const selectedText = getSelected(text, selection);
                            setText((text) => replaceText(text, `>!${selectedText}!<`, selection));
                        }}>
                            <FontAwesome name='eye-slash' size={24} color={theme.iconPrimary}/>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    loginSubContainer: {
        position: 'absolute',
        top: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        zIndex: 1,
        paddingVertical: 10,
    },
    safeContainers: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    topBarTitle: {
        fontSize: 18,
    },
    topBarButton: {
        fontSize: 18,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
    previewTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        marginTop: 5,
        borderBottomWidth: 1,
    },
    previewTypeText: {
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 5,
        overflow: 'hidden',
    },
    renderHTMLContainer: {
        minHeight: 150,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    bottomBar: {
        height: 50,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
});
