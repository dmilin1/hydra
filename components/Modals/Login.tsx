import React, { ReactNode, useContext } from 'react';
import { Share, StyleSheet, View, Text, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { ThemeContext, t } from '../../contexts/ThemeContext';
import { Entypo, Feather } from '@expo/vector-icons';
import { AccountContext } from '../../contexts/AccountContext';

type LoginProps = {
    visible: boolean,
    setVisible: (visible: boolean) => void,
}

export default function Login({ visible, setVisible }: LoginProps) {
    const { theme } = useContext(ThemeContext);
    const { addUser } = useContext(AccountContext);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    return visible ? (
        <View style={styles.loginContainer}>
            <View style={t(styles.loginSubContainer, {
                backgroundColor: theme.background,
                borderColor: theme.divider,
            })}>
                <View style={styles.iconContainer}>
                    <Feather
                        name="user-plus"
                        style={{ color: theme.text, fontSize: 32 }}
                    />
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={t(styles.textLabel, {
                        color: theme.text
                    })}>
                        Username:
                    </Text>
                    <TextInput
                        style={t(styles.textInput, {
                            color: theme.text,
                            borderColor: theme.divider,
                        })}
                        onChangeText={text => setUsername(text)}
                        value={username}
                        autoComplete='username'
                        autoCapitalize='none'
                    />
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={t(styles.textLabel, {
                        color: theme.text
                    })}>
                        Password:
                    </Text>
                    <TextInput
                        style={t(styles.textInput, {
                            color: theme.text,
                            borderColor: theme.divider,
                        })}
                        onChangeText={text => setPassword(text)}
                        value={password}
                        autoComplete='current-password'
                        autoCapitalize='none'
                        secureTextEntry={true}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={t(styles.button, {
                            borderColor: theme.divider,
                        })}
                        onPress={async () => {
                            if (await addUser({ username, password })) {
                                setVisible(false);
                                setUsername('');
                                setPassword('');
                            }
                        }}
                    >
                        <Text style={t(styles.buttonText, {
                            color: theme.buttonText,
                        })}>
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.background} onTouchStart={() => {
                setVisible(false)
                setUsername('');
                setPassword('');
            }}/>
        </View>
    ) : null;
}

const styles = StyleSheet.create({
    loginContainer: {
        position: 'relative',
        zIndex: 1000,
    },
    loginSubContainer: {
        position: 'absolute',
        top: 0,
        width: Dimensions.get('window').width * 0.9,
        marginTop: '25%',
        marginHorizontal: '5%',
        zIndex: 1,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
    },
    background: {
        position: 'absolute',
        width: '100%',
        top: 0,
        left: 0,
        height: Dimensions.get('window').height,
        backgroundColor: 'black',
        opacity: 0.7,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 15,
    },
    fieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    textLabel: {
        fontSize: 18,
        marginRight: 10,
    },
    textInput: {
        fontSize: 18,
        borderWidth: 1,
        flex: 1,
        borderRadius: 5,
        maxWidth: 175,
        padding: 5,
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 18,
    }
});
