import globalStyle from "@/constants/globalStyle";
import {useI18N} from "@/core/i18n";
import Theme, {basicColorValues, getCurrentThemeDefault} from "@/core/theme";
import React from "react";
import {StyleSheet, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import ListItem from "@/components/base/listItem";
import ColorSelect from "@/components/base/colorSelect";

const showSelectConfigColorKey = ["primary", "appBar"]

export default function ThemeColors() {
    const theme = Theme.useTheme();
    const {t} = useI18N();
    let defaultTheme = getCurrentThemeDefault();

    return (
        <ScrollView style={globalStyle.fwflex1}>
            <View style={styles.colorsContainer}>
                {Theme.configableColorKey.map(key => (
                    <ListItem key={key} style={styles.listItem} withHorizontalPadding heightType="small">
                        <ListItem.Content title={t(`setCustomTheme.${key}Color` as any)} style={styles.title}/>
                        <ColorSelect color={theme.colors[key]} options={
                            getOptions(key, theme, defaultTheme)
                        } onSelect={
                            (color) => {
                                Theme.setColors({[key]: color});
                            }
                        }  style={styles.colorSelect}/>
                    </ListItem>
                ))}
            </View>
        </ScrollView>
    );
}

function getOptions(key, theme, defaultTheme) {
    if (showSelectConfigColorKey.includes(key)) {
        console.log(theme.id)
        if (theme.id === 'custom') {
            return [defaultTheme.colors[key], ...basicColorValues]
        } else {
            return undefined;
        }
    } else {
        return [defaultTheme.colors[key]]
    }
}

const styles = StyleSheet.create({
    colorsContainer: {},
    listItem:{},
    title: {
        flex: 1,
    },
    scrollView: {
    },
    colorSelect: {
        flex: 1,
    }
});
