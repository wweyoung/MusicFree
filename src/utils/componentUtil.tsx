import {AppConfigPropertyKey} from "@/types/core/config";
import {showDialog} from "@/components/dialogs/useDialog";
import Config from "@/core/appConfig";
import ThemeText from "@/components/base/themeText";
import React from "react";
import ThemeSwitch from "@/components/base/switch";
import {StyleSheet} from "react-native";
import rpx from "@/utils/rpx";

export function createSwitch(
    title: string,
    changeKey: AppConfigPropertyKey,
    value: boolean,
    callback?: (newValue: boolean) => void,
) {
    const onPress = () => {
        if (callback) {
            callback(!value);
        } else {
            Config.setConfig(changeKey, !value);
        }
    };
    return {
        title,
        onPress,
        right: <ThemeSwitch value={value} onValueChange={onPress}/>,
    };
}

export const createRadio = function (
    title: string,
    changeKey: AppConfigPropertyKey,
    candidates: Array<string | number>,
    value: string | number,
    valueMap?: Record<string | number, string | number>,
    onChange?: (value: string | number) => void,
) {
    const onPress = () => {
        showDialog("RadioDialog", {
            title,
            content: valueMap
                ? candidates.map(_ => ({
                    label: valueMap[_] as string,
                    value: _,
                }))
                : candidates,
            onOk(val) {
                Config.setConfig(changeKey, val);
                onChange?.(val);
            },
        });
    };
    return {
        title,
        right: (
            <ThemeText style={styles.centerText}>
                {valueMap ? valueMap[value] : value}
            </ThemeText>
        ),
        onPress,
    };
};

const styles = StyleSheet.create({
    centerText: {
        textAlignVertical: "center",
        maxWidth: rpx(400),
    },
})
