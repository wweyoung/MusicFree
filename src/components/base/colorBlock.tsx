import React from "react";
import {Image, StyleSheet, View} from "react-native";
import rpx from "@/utils/rpx";
import {ImgAsset} from "@/constants/assetsConst";
import useColors from "@/hooks/useColors";
import LinearGradient from "react-native-linear-gradient";
import {basicColors} from "@/core/theme";

interface IColorBlockProps {
    color: string;
    barStyle?: number,
    isShowLinear?: boolean
}

export default function ColorBlock(props: IColorBlockProps) {
    const {color, barStyle, isShowLinear} = props;

    let colors = useColors();

    return (
        <View style={[styles.showBar, {borderColor: colors.divider}, barStyle]}>
            {isShowLinear && <LinearGradient
                colors={[basicColors.rgb333, color, 'rgba(0,0,0,0)']}
                start={{ x: 0.7, y: 1 }}   // 从右下开始
                end={{ x: 1, y: 0.4 }}     // 向左上淡出
                style={[styles.showBarContent, styles.cornerGradient]}
            />}
            <Image
                resizeMode="repeat"
                source={ImgAsset.transparentBg}
                style={styles.transparentBg}
            />
            <View
                style={[
                    styles.showBarContent,
                    {
                        backgroundColor: color,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    showBar: {
        width: rpx(76),
        height: rpx(50),
        borderWidth: 1,
        borderStyle: "solid"
    },
    showBarContent: {
        width: "100%",
        height: "100%",
        position: "absolute",
        borderRadius: rpx(10),
        overflow: "hidden",
        left: 0,
        top: 0,
    },
    transparentBg: {
        position: "absolute",
        zIndex: -1,
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        borderRadius: rpx(10),
        overflow: "hidden",
    },
    cornerGradient: {
        zIndex: 1,
    }
});
