import React, { useContext, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { ThemeContext, t } from '../../../contexts/ThemeContext';
import { HistoryContext } from '../../../contexts/HistoryContext';
import { Post } from '../../../api/Posts';
import Slideable from '../../UI/Slideable';
import { vote, VoteOption } from '../../../api/PostDetail';
import { CommentReply, setMessageNewStatus } from '../../../api/Messages';
import RenderHtml from '../../HTML/RenderHTML';
import { InboxContext } from '../../../contexts/InboxContext';

type MessageComponentProps = {
    initialMessageState: CommentReply
}

export default function MessageComponent({ initialMessageState } : MessageComponentProps) {
    const history = useContext(HistoryContext);
    const { theme } = useContext(ThemeContext);
    const { inboxCount, setInboxCount } = useContext(InboxContext);

    const [message, setMessage] = useState(initialMessageState);

    const currentVoteColor = (
        message.userVote === VoteOption.UpVote ? theme.upvote
        : message.userVote === VoteOption.DownVote ? theme.downvote
        : theme.subtleText
    );

    const voteOnMessage = async (voteOption: VoteOption) => {
        const result = await vote(message, voteOption);
        setMessage({
            ...message,
            upvotes: message.upvotes - message.userVote + result,
            userVote: result,
        });
    };

    return (
        <Slideable
            left={[{
                icon: <AntDesign name="arrowup"/>,
                color: theme.upvote,
                action: async () => voteOnMessage(VoteOption.UpVote),
            }, {
                icon: <AntDesign name="arrowdown"/>,
                color: theme.downvote,
                action: async () => voteOnMessage(VoteOption.DownVote),
            }]}
            right={[{
                icon: <Feather name="mail" size={18} color={theme.subtleText} />,
                color: theme.iconPrimary,
                action: async () => {
                    await setMessageNewStatus(message, !message.new);
                    setInboxCount(inboxCount + (message.new ? -1 : 1));
                    setMessage({
                        ...message,
                        new: !message.new,
                    });
                },
            }]}
        >
            <TouchableOpacity
                activeOpacity={0.8}
                style={t(styles.messageContainer, {
                    backgroundColor: theme.background,
                })}
                onPress={() => {
                    setMessageNewStatus(message, false);
                    setMessage({
                        ...message,
                        new: false,
                    });
                    history.pushPath(message.contextLink);
                }}
            >
                <View style={styles.messageTitleContainer}>
                    <Feather name="message-square" size={18} color={message.new ? theme.iconPrimary : theme.subtleText} />
                    <View style={styles.messageTitleTextContainer}>
                    <Text
                        numberOfLines={2}
                        style={t(styles.messageTitle, {
                            color: theme.verySubtleText,
                        })}
                    >
                        <Text style={{ color: theme.text }}>Reply to your comment in </Text>
                        {message.postTitle}
                    </Text>
                    </View>
                </View>
                <View style={styles.messageBody}>
                    <RenderHtml html={message.html} />
                </View>
                <View style={styles.messageFooter}>
                    <View style={styles.footerLeft}>
                        <View style={styles.subAndAuthorContainer}>
                            <Text style={t(styles.smallText, {
                                color: theme.subtleText,
                            })}>in </Text>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => history.pushPath(`https://www.reddit.com/r/${message.subreddit}`)}
                            >
                                <Text style={t(styles.boldedSmallText, {
                                    color: theme.subtleText,
                                })}>
                                    {message.subreddit}
                                </Text>
                            </TouchableOpacity>
                            <Text style={t(styles.smallText, {
                                color: theme.subtleText,
                            })}> by </Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => history.pushPath(`https://www.reddit.com/user/${message.author}`)}
                            >
                                <Text style={t(styles.boldedSmallText, {
                                    color: theme.subtleText,
                                })}>
                                    {message.author}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.metadataContainer}>
                            <Feather
                                name={message.userVote === VoteOption.DownVote ? 'arrow-down' : 'arrow-up'}
                                size={18}
                                color={currentVoteColor}
                            />
                            <Text style={t(styles.metadataText, {
                                color: currentVoteColor,
                            })}>
                                {message.upvotes}
                            </Text>
                            <Feather name="clock" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                {message.timeSince}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.footerRight}>

                    </View>
                </View>
            </TouchableOpacity>
            <View
                style={t(styles.spacer, {
                    backgroundColor: theme.tint,
                })}
            />
        </Slideable>
    )
}


const styles = StyleSheet.create({
    messageContainer: {
        flex: 1,
        paddingVertical: 12,
    },
    messageTitleContainer: {
        flexDirection: 'row',
        marginHorizontal: 10,
        alignItems: 'center',
    },
    messageTitleTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    messageTitle: {
        fontSize: 14,
    },
    messageBody: {
        flex: 1,
        marginVertical: 5,
        marginHorizontal: 10,
    },
    messageFooter: {
        marginHorizontal: 10,
    },
    footerLeft: {
        flex: 1,
    },
    footerRight: {
        flex: 1,
    },
    subAndAuthorContainer: {
        flexDirection: 'row',
    },
    smallText: {
        fontSize: 14,
    },
    boldedSmallText: {
        fontSize: 14,
        fontWeight: '600',
    },
    metadataContainer: {
        flexDirection: 'row',
        marginTop: 7,
        alignItems: 'center',
    },
    metadataText: {
        fontSize: 14,
        marginLeft: 3,
        marginRight: 12,
    },
    spacer: {
        height: 10,
    },
});