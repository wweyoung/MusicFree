import {useI18N} from "@/core/i18n";
import {ROUTE_PATH, useNavigate} from "@/core/router";
import rpx from "@/utils/rpx";
import React from "react";
import {ScrollView, StyleSheet, View} from "react-native";  // 注意：不需要額外 import View，除非你要用
import ActionButton from "./ActionButton";
import useOrientation from "@/hooks/useOrientation";

export default function Operations() {
    const navigate = useNavigate();
    const {t} = useI18N();
    const orientation = useOrientation();

    const actionButtons = [
        {
            iconName: "fire",
            title: t("home.recommendSheet"),
            action() {
                navigate(ROUTE_PATH.RECOMMEND_SHEETS);
            },
        },
        {
            iconName: "trophy",
            title: t("home.topList"),
            action() {
                navigate(ROUTE_PATH.TOP_LIST);
            },
        },
        {
            iconName: "clock-outline",
            title: t("home.playHistory"),
            action() {
                navigate(ROUTE_PATH.HISTORY);
            },
        },
        {
            iconName: "folder-music-outline",
            title: t("home.localMusic"),
            action() {
                navigate(ROUTE_PATH.LOCAL);
            },
        },
    ] as const;

    return (
        <View>
            <ScrollView contentContainerStyle={[styles.container, styles[`container_${orientation}`]]}>
                {actionButtons.map((action) => (
                    <ActionButton
                        style={[styles.actionButtonStyle, styles[`actionButtonStyle_${orientation}`]]}
                        key={action.title}
                        {...action}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: rpx(24),
        flexWrap: "wrap",
    },
    container_vertical: {
        paddingVertical: rpx(32),
        alignSelf: 'center',
    },
    container_horizontal: {
        width: rpx(320),
        paddingHorizontal: rpx(32),
    },

    actionButtonStyle: {
        borderRadius: rpx(18),
    },
    actionButtonStyle_vertical: {
        width: rpx(157.5),
        height: rpx(160),
    },
    actionButtonStyle_horizontal: {
        minWidth: '100%',
    }
});
