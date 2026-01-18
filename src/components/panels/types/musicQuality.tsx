import React, { Fragment } from "react";
import { Pressable, StyleSheet } from "react-native";
import rpx from "@/utils/rpx";
import ThemeText from "@/components/base/themeText";

import { qualityKeys, qualityText } from "@/utils/qualities";
import { sizeFormatter } from "@/utils/fileUtils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PanelBase from "../base/panelBase";
import { ScrollView } from "react-native-gesture-handler";
import { hidePanel } from "../usePanel";
import Divider from "@/components/base/divider";
import PanelHeader from "../base/panelHeader";
import { useI18N } from "@/core/i18n";

interface IMusicQualityProps {
    type?: "play" | "download"| "upload";
    /** 歌曲信息 */
    musicItem: IMusic.IMusicItem;
    /** 点击回调 */
    onQualityPress: (
        quality: IMusic.IQualityKey,
        musicItem: IMusic.IMusicItem,
    ) => void;
}

export default function MusicQuality(props: IMusicQualityProps) {
    const safeAreaInsets = useSafeAreaInsets();
    const i18n = useI18N();

    const { musicItem, onQualityPress, type = "play" } = props ?? {};
    const titles = {
        play: "common.play",
        download: "common.download",
        upload: "common.upload",
    };
    const showQualityKeys = qualityKeys.filter(quality => musicItem.qualities?.[quality]?.url);
    if (!showQualityKeys.length) {
        showQualityKeys.push("standard");
    }

    return (
        <PanelBase
            height={rpx(520)}
            renderBody={() => (
                <>
                    <PanelHeader
                        title={i18n.t("panel.musicQuality.title", {
                            type: i18n.t(titles[type]),
                        })}
                        hideButtons
                    />
                    <Divider />

                    <ScrollView
                        style={[
                            style.body,
                            {
                                marginBottom: safeAreaInsets.bottom,
                            },
                        ]}>
                        {showQualityKeys.map(key => {
                            return (
                                <Fragment key={`frag-${key}`}>
                                    <Pressable
                                        key={`btn-${key}`}
                                        style={style.item}
                                        onPress={() => {
                                            onQualityPress(key, musicItem);
                                            hidePanel();
                                        }}>
                                        <ThemeText>
                                            {qualityText[key]}{" "}
                                            {musicItem.qualities?.[key]?.size
                                                ? `(${sizeFormatter(
                                                      musicItem.qualities[key]
                                                          .size!,
                                                )})`
                                                : ""}
                                        </ThemeText>
                                    </Pressable>
                                </Fragment>
                            );
                        })}
                    </ScrollView>
                </>
            )}
        />
    );
}

const style = StyleSheet.create({
    header: {
        width: rpx(750),
        flexDirection: "row",
        padding: rpx(24),
    },
    body: {
        flex: 1,
        paddingHorizontal: rpx(24),
    },
    item: {
        height: rpx(96),
        justifyContent: "center",
    },
});
