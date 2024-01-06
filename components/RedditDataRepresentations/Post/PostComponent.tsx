import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { ThemeContext, t } from '../../../contexts/ThemeContext';
import VideoPlayer from './PostParts/PostMediaParts/VideoPlayer';
import ImageViewer from './PostParts/PostMediaParts/ImageViewer';
import PollViewer from './PostParts/PostMediaParts/PollViewer';
import { HistoryContext } from '../../../contexts/HistoryContext';
import { Post } from '../../../api/Posts';
import Link from './PostParts/PostMediaParts/Link';
import PostMedia from './PostParts/PostMedia';


export default function PostComponent({ post } : { post: Post }) {
    const history = useContext(HistoryContext);
    const theme = useContext(ThemeContext);

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.8}
                style={t(styles.postContainer, {
                    backgroundColor: theme.background,
                })}
                onPress={() => {
                    history.pushPath(post.link);
                }}
            >
                <Text
                    numberOfLines={2}
                    style={t(styles.postTitle, {
                    color: theme.text,
                    })}
                >
                    {post.title}
                </Text>
                <View style={styles.postBody}>
                    <PostMedia
                        post={post}
                        maxLines={3}
                        renderHTML={false}
                    />
                </View>
                <View style={styles.postFooter}>
                    <View style={styles.footerLeft}>
                        <View style={styles.subAndAuthorContainer}>
                            <Text style={t(styles.smallText, {
                                color: theme.subtleText,
                            })}>in </Text>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => history.pushPath(`https://www.reddit.com/r/${post.subreddit}`)}
                            >
                                <Text style={t(styles.boldedSmallText, {
                                    color: theme.subtleText,
                                })}>
                                    {post.subreddit}
                                </Text>
                            </TouchableOpacity>
                            <Text style={t(styles.smallText, {
                                color: theme.subtleText,
                            })}> by </Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => history.pushPath(`https://www.reddit.com/user/${post.author}`)}
                            >
                                <Text style={t(styles.boldedSmallText, {
                                    color: theme.subtleText,
                                })}>
                                    {post.author}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.metadataContainer}>
                            <Feather name="arrow-up" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                {post.upvotes}
                            </Text>
                            <Feather name="message-square" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                {post.commentCount}
                            </Text>
                            <Feather name="clock" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                {post.timeSincePost}
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
        </View>
    )
}


const styles = StyleSheet.create({
    postContainer: {
        flex: 1,
        paddingVertical: 12,
    },
    postTitle: {
        fontSize: 17,
        paddingHorizontal: 10,
    },
    postBody: {
        flex: 1,
        marginVertical: 5,
    },
    postFooter: {
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