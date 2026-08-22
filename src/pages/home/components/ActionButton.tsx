import ThemeText from "@/components/base/themeText";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon, { IIconName } from "@/components/base/icon.tsx";
import useOrientation from "@/hooks/useOrientation";

interface IActionButtonProps {
    iconName: IIconName;
    iconColor?: string;
    title: string;
    action?: () => void;
    style?: StyleProp<ViewStyle>;
}

export default function ActionButton(props: IActionButtonProps) {
    const { iconName, iconColor, title, action, style } = props;
    const colors = useColors();
    const orientation = useOrientation();

    // rippleColor="rgba(0, 0, 0, .32)"
    return (
        <TouchableOpacity
            onPress={action}
            style={[
                styles.wrapper,
                styles[`wrapper_${orientation}`],
                {
                    backgroundColor: colors.card,
                },
                style,
            ]}>
            <>
                <Icon
                    accessible={false}
                    name={iconName}
                    color={iconColor ?? colors.text}
                    size={rpx(48)}
                />
                <ThemeText
                    accessible={false}
                    fontSize="subTitle"
                    fontWeight="semibold"
                    style={[styles.text, styles[`text_${orientation}`]]}>
                    {title}
                </ThemeText>
            </>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: rpx(140),
        borderRadius: rpx(12),
        flexGrow: 1,
        flexShrink: 0,
        alignItems: "center",
    },
    wrapper_vertical: {
        height: rpx(144),
        justifyContent: "center",
    },
    wrapper_horizontal: {
        flexDirection: "row",
        height: rpx(100),
        paddingHorizontal: rpx(30),
    },
    text: {
    },
    text_vertical: {
        marginTop: rpx(12),
    },
    text_horizontal: {
        marginLeft: rpx(12),
    },
});
