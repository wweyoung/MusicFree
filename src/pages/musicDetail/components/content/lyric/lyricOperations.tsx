import React from "react";
import {StyleSheet, View} from "react-native";
import rpx from "@/utils/rpx";
import {iconSizeConst} from "@/constants/uiConst";
import TranslationIcon from "@/assets/icons/translation.svg";
import useColors from "@/hooks/useColors";
import Toast from "@/utils/toast";
import {hidePanel, showPanel} from "@/components/panels/usePanel";
import TrackPlayer from "@/core/trackPlayer";
import PersistStatus from "@/utils/persistStatus";
import useOrientation from "@/hooks/useOrientation";
import HeartIcon from "../heartIcon";
import Icon from "@/components/base/icon.tsx";
import lyricManager, {useLyricState} from "@/core/lyricManager";
import {ROUTE_PATH, useNavigate} from "@/core/router";

interface ILyricOperationsProps {
    scrollToCurrentLrcItem: () => void;
}

export default function LyricOperations(props: ILyricOperationsProps) {
    const { scrollToCurrentLrcItem } = props;

    const detailFontSize = PersistStatus.useValue("lyric.detailFontSize");

    const { hasTranslation } = useLyricState();
    const showTranslation = PersistStatus.useValue(
        "lyric.showTranslation",
        false,
    );
    const colors = useColors();
    const orientation = useOrientation();
    const navigate = useNavigate();

    return (
        <View style={styles.container}>
            {orientation === "vertical" ? <HeartIcon /> : null}
            <Icon
                name="font-size"
                size={iconSizeConst.normal}
                color="white"
                onPress={() => {
                    showPanel("SetFontSize", {
                        defaultSelect: detailFontSize ?? 1,
                        onSelectChange(value) {
                            scrollToCurrentLrcItem();
                        },
                    });
                }}
            />
            <Icon
                name="arrows-left-right"
                size={iconSizeConst.normal}
                color="white"
                onPress={() => {
                    const currentMusicItem = TrackPlayer.currentMusic;

                    if (currentMusicItem) {
                        showPanel("SetLyricOffset", {
                            musicItem: currentMusicItem,
                            onSubmit(offset) {
                                lyricManager.updateLyricOffset(currentMusicItem, offset);
                                scrollToCurrentLrcItem();
                                hidePanel();
                            },
                        });
                    }
                }}
            />
            {hasTranslation &&
            <TranslationIcon
                width={iconSizeConst.normal}
                height={iconSizeConst.normal}
                opacity={!hasTranslation ? 0.2 : showTranslation ? 1 : 0.5}
                color={
                    showTranslation && hasTranslation ? colors.primary : "white"
                }
                // style={}
                onPress={() => {
                    if (!hasTranslation) {
                        Toast.warn("当前歌曲无翻译");
                        return;
                    }

                    PersistStatus.set(
                        "lyric.showTranslation",
                        !showTranslation,
                    );
                    scrollToCurrentLrcItem();
                }}
            />
            }
            <Icon
                name="lyric-setting"
                size={iconSizeConst.normal}
                color="white"
                onPress={() => {
                    navigate(ROUTE_PATH.SETTING, {
                        type: "lyric",
                    });
                }}
            />
            <Icon
                name="ellipsis-vertical"
                size={iconSizeConst.normal}
                color={"white"}
                onPress={() => {
                    const currentMusic = TrackPlayer.currentMusic;
                    if (currentMusic) {
                        showPanel("MusicItemLyricOptions", {
                            musicItem: currentMusic,
                        });
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: rpx(80),
        marginBottom: rpx(24),
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
});
