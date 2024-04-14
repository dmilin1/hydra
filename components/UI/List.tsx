import { TouchableOpacity, View, StyleSheet, Text } from "react-native"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext"
import { Fragment, ReactNode, useContext } from "react";
import SectionTitle from "./SectionTitle";


type ListItem = {
    key: string,
    icon: ReactNode,
    rightIcon?: ReactNode,
    text: string,
    onPress: () => void,
}

type ListProps = {
    items: ListItem[],
    title?: string,
}

export default function List({ items, title }: ListProps) {
    const { theme } = useContext(ThemeContext);

    return (
        <>
            { title && <SectionTitle text={title}/> }
            <View style={t(styles.listContainer, {
                backgroundColor: theme.tint
            })}>
                {items.map((item, i) => (
                    <TouchableOpacity
                        key={item.key}
                        onPress={item.onPress}
                        activeOpacity={0.5}
                        style={t(styles.itemButtonContainer, {
                            borderBottomColor: i < items.length - 1 ? theme.divider : 'transparent',
                        })}
                    >
                        <View
                            style={styles.itemButtonSubContainer}
                        >
                            <View style={styles.iconMargin}>
                                {item.icon}
                            </View>
                            <Text style={t(styles.itemButtonText, {
                                color: theme.text,
                            })}>
                                {item.text}
                            </Text>
                            {item.rightIcon ??
                                <MaterialIcons name='keyboard-arrow-right' size={30} color={theme.verySubtleText} style={styles.iconMargin}/>
                            }
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    listTitle: {
        marginTop: 15,
        marginBottom: 10,
        marginHorizontal: 25,
        fontSize: 14,
    },
    listContainer: {
        flex: 1,
        marginHorizontal: 10,
        paddingHorizontal: 5,
        borderRadius: 10,
    },
    itemButtonContainer: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
    },
    itemButtonSubContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemButtonText: {
        fontSize: 17,
        flex: 1,
        marginLeft: 10,
    },
    iconMargin: {
        marginVertical: -100,
    }
});
  