import React, { memo, useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import { fontSizeConst } from "@/constants/uiConst";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from "react-native-reanimated";

interface ILyricItemComponentProps {
    index?: number;
    light?: boolean;
    highlight?: boolean;
    text?: string;
    fontSize?: number;
    textAlign?: "center" | "left";
    onLayout?: (index: number, height: number) => void;
}

function _LyricItemComponent(props: ILyricItemComponentProps) {
    const {
        light,
        highlight = false,
        text,
        onLayout,
        index,
        fontSize = fontSizeConst.content,
        textAlign,
    } = props;

    const colors = useColors();

    // 使用 shared value 控制缩放比例
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withTiming(highlight ? 1 : 0, {
            duration: 250,
            easing: Easing.linear,
        });
    }, [highlight]);
    const animatedStyle = useAnimatedStyle(() => ({
        fontSize: (1 + 0.2 * scale.value) * fontSize,
    }));

    return (
        <Animated.Text
            onLayout={({ nativeEvent }) => {
                if (index !== undefined) {
                    onLayout?.(index, nativeEvent.layout.height);
                }
            }}
            style={[
                animatedStyle,
                lyricStyles.item,
                {
                    textAlign: textAlign || "center",
                },
                highlight && [
                    lyricStyles.highlightItem,
                    {
                        color: colors.primary,
                    },
                ],
                light && lyricStyles.draggingItem,
            ]}
        >
            {text}
        </Animated.Text>
    );
}

const LyricItemComponent = memo(
    _LyricItemComponent,
    (prev, curr) =>
        prev.light === curr.light &&
        prev.highlight === curr.highlight &&
        prev.text === curr.text &&
        prev.index === curr.index &&
        prev.fontSize === curr.fontSize &&
        prev.textAlign === curr.textAlign,
);

export default LyricItemComponent;

const lyricStyles = StyleSheet.create({
    highlightItem: {
        opacity: 1,
        fontWeight: '500'
    },
    item: {
        color: "white",
        opacity: 0.6,
        paddingHorizontal: rpx(64),
        paddingVertical: rpx(24),
        width: "100%",
        textAlignVertical: "center",
    },
    draggingItem: {
        opacity: 0.9,
        color: "white",
    },
});
