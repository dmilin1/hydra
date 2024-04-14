import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext, t } from '../../../contexts/SettingsContexts/ThemeContext';
import { HistoryContext } from '../../../contexts/HistoryContext';
import Numbers from '../../../utils/Numbers';
import { User } from '../../../api/User';


export default function UserComponent({ user } : { user: User }) {
    const history = useContext(HistoryContext);
    const { theme } = useContext(ThemeContext);

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.8}
                style={t(styles.userContainer, {
                    backgroundColor: theme.background,
                })}
                onPress={() => {
                    history.pushPath('/user/' + user.userName);
                }}
            >
                <Text
                    style={t(styles.userTitle, {
                        color: theme.text,
                    })}
                >
                    {user.userName}
                </Text>
                <View style={styles.userFooter}>
                    <View style={styles.footerLeft}>
                        <View style={styles.metadataContainer}>
                            <MaterialCommunityIcons name="star-four-points-outline" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                {new Numbers(user.postKarma + user.commentKarma).prettyNum()} karma
                            </Text>
                            <Ionicons name="person-add-outline" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                Friends: {user.friends ? 'Yes' : 'No'}
                            </Text>
                            <Feather name="clock" size={18} color={theme.subtleText} />
                            <Text style={t(styles.metadataText, {
                                color: theme.subtleText,
                            })}>
                                {user.timeSinceCreated}
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
    userContainer: {
        flex: 1,
        paddingVertical: 12,
    },
    userTitle: {
        fontSize: 17,
        paddingHorizontal: 10,
        marginBottom: 5,
    },
    userBody: {
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
    userFooter: {
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