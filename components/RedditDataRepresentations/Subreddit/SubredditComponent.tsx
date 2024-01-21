import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { ThemeContext, t } from '../../../contexts/ThemeContext';
import { HistoryContext } from '../../../contexts/HistoryContext';
import { getPosts, Post } from '../../../api/Posts';
import { Subreddit } from '../../../api/Subreddits';
import RenderHtml from '../../HTML/RenderHTML';
import Numbers from '../../../utils/Numbers';


export default function SubredditComponent({ subreddit } : { subreddit: Subreddit }) {
    const history = useContext(HistoryContext);
    const theme = useContext(ThemeContext);

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.8}
                style={t(styles.subredditContainer, {
                    backgroundColor: theme.background,
                })}
                onPress={() => {
                    history.pushPath(subreddit.url);
                }}
            >
                <Text
                    style={t(styles.subredditTitle, {
                        color: theme.text,
                    })}
                >
                    /r/{subreddit.name}
                </Text>
                <View style={styles.subredditBody}>
                    <View style={styles.bodyTextContainer}>
                        <Text
                            numberOfLines={3}
                            style={t(styles.bodyText, {
                                color: theme.subtleText,
                            })}
                        >
                            {subreddit.description ? subreddit.description : 'No description'}
                        </Text>
                    </View>
                </View>
                <View style={styles.subredditFooter}>
                    <View style={styles.footerLeft}>
                        <View style={styles.metadataContainer}>
                            <Ionicons name="person-outline" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                {new Numbers(subreddit.subscribers).prettyNum()}
                            </Text>
                            <FontAwesome name="feed" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                {subreddit.subscribed ? 'Joined' : 'Not Subscribed'}
                            </Text>
                            <Feather name="clock" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                {subreddit.timeSinceCreation}
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
    subredditContainer: {
        flex: 1,
        paddingVertical: 12,
    },
    subredditTitle: {
        fontSize: 17,
        paddingHorizontal: 10,
    },
    subredditBody: {
        flex: 1,
        marginVertical: 5,
    },
    bodyTextContainer: {
        marginHorizontal: 10,
        marginVertical: 10,
    },
    bodyText: {
        fontSize: 15,
    },
    subredditFooter: {
        marginHorizontal: 10,
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
    footerLeft: {
        flex: 1,
    },
    footerRight: {
        flex: 1,
    },
    spacer: {
        height: 10,
    },
});