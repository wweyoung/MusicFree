import Config, {useAppConfig} from "@/core/appConfig";
import useColors from "@/hooks/useColors";
import {useI18N} from "@/core/i18n";
import {createRadio, createSwitch} from "@/utils/componentUtil";
import LyricUtil, {NativeTextAlignment} from "@/native/lyricUtil";
import Toast from "@/utils/toast";
import {StyleSheet, View} from "react-native";
import ListItem from "@/components/base/listItem";
import ThemeText from "@/components/base/themeText";
import Slider from "@react-native-community/slider";
import rpx from "@/utils/rpx";
import ColorSelect from "@/components/base/colorSelect";
import {basicColorValues} from "@/core/theme";
import {getBackgroundColor} from "@/utils/colorUtil";
import React, {useEffect} from "react";
import {showPanel} from "@/components/panels/usePanel";
import {useMusicState} from "@/core/trackPlayer";
import lyricManager from "@/core/lyricManager";
import {musicIsPaused} from "@/utils/trackUtils";

export function LyricSetting() {
    /**
     * // Lyric
     *     "lyric.showStatusBarLyric": boolean;
     *     "lyric.topPercent": number;
     *     "lyric.leftPercent": number;
     *     "lyric.align": number;
     *     "lyric.color": string;
     *     "lyric.backgroundColor": string;
     *     "lyric.widthPercent": number;
     *     "lyric.fontSize": number;
     *     "lyric.detailFontSize": number;
     *     "lyric.autoSearchLyric": boolean;
     */
    const showStatusBarLyric = useAppConfig("lyric.showStatusBarLyric");
    const topPercent = useAppConfig("lyric.topPercent");
    const leftPercent = useAppConfig("lyric.leftPercent");
    const align = useAppConfig("lyric.align");
    const color = useAppConfig("lyric.color");
    const backgroundColor = useAppConfig("lyric.backgroundColor");
    const widthPercent = useAppConfig("lyric.widthPercent");
    const fontSize = useAppConfig("lyric.fontSize");
    const enableAutoSearchLyric = useAppConfig("lyric.autoSearchLyric");


    const colors = useColors();

    const {t} = useI18N();

    const musicState = useMusicState();
    const isPaused = musicIsPaused(musicState);

    useEffect(() => {
        LyricUtil.isShowStatusBar().then(isShow => {
            if (!isShow) {
                // 桌面歌词被隐藏，重新打开
                lyricManager.showStatusBarLyric();
            }
        });
        return () => {
            if (!showStatusBarLyric || isPaused) {
                lyricManager.hideStatusBarLyric();
            }
        }
    }, []);

    const autoSearchLyric = createSwitch(
        t("basicSettings.lyric.autoSearchLyric"),
        "lyric.autoSearchLyric",
        enableAutoSearchLyric ?? false,
    );

    const openStatusBarLyric = createSwitch(
        t("basicSettings.lyric.showStatusBarLyric"),
        "lyric.showStatusBarLyric",
        showStatusBarLyric ?? false,
        async newValue => {
            try {
                if (newValue) {
                    const hasPermission =
                        await LyricUtil.checkSystemAlertPermission();

                    if (hasPermission) {
                        const statusBarLyricConfig = {
                            topPercent: Config.getConfig("lyric.topPercent"),
                            leftPercent: Config.getConfig("lyric.leftPercent"),
                            align: Config.getConfig("lyric.align"),
                            color: Config.getConfig("lyric.color"),
                            backgroundColor: Config.getConfig("lyric.backgroundColor"),
                            widthPercent: Config.getConfig("lyric.widthPercent"),
                            fontSize: Config.getConfig("lyric.fontSize"),
                        };
                        LyricUtil.showStatusBarLyric(
                            "MusicFree",
                            statusBarLyricConfig ?? {}
                        );
                        Config.setConfig("lyric.showStatusBarLyric", true);
                    } else {
                        LyricUtil.requestSystemAlertPermission().finally(() => {
                            Toast.warn(t("toast.noFloatWindowPermission"));
                        });
                    }
                } else {
                    LyricUtil.hideStatusBarLyric();
                    Config.setConfig("lyric.showStatusBarLyric", false);
                }
            } catch {
            }
        },
    );

    const alignStatusBarLyric = createRadio(
        t("basicSettings.lyric.align"),
        "lyric.align",
        [
            NativeTextAlignment.LEFT,
            NativeTextAlignment.CENTER,
            NativeTextAlignment.RIGHT,
        ],
        align ?? NativeTextAlignment.CENTER,
        {
            [NativeTextAlignment.LEFT]: t("basicSettings.lyric.align.left"),
            [NativeTextAlignment.CENTER]: t("basicSettings.lyric.align.center"),
            [NativeTextAlignment.RIGHT]: t("basicSettings.lyric.align.right"),
        },
        newVal => {
            if (showStatusBarLyric) {
                LyricUtil.setStatusBarLyricAlign(newVal as any);
            }
        },
    );

    return (
        <View>
            <ListItem
                withHorizontalPadding
                heightType="small"
                onPress={autoSearchLyric.onPress}>
                <ListItem.Content title={autoSearchLyric.title}/>
                {autoSearchLyric.right}
            </ListItem>
            <ListItem
                withHorizontalPadding
                heightType="small"
                onPress={openStatusBarLyric.onPress}>
                <ListItem.Content title={openStatusBarLyric.title}/>
                {openStatusBarLyric.right}
            </ListItem>
            {showStatusBarLyric &&
            <View>
                <View style={lyricStyles.sliderContainer}>
                    <ThemeText>{t("basicSettings.lyric.leftRightDistance")}</ThemeText>
                    <Slider
                        style={lyricStyles.slider}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.text ?? "#999999"}
                        thumbTintColor={colors.primary}
                        minimumValue={0}
                        step={0.001}
                        value={leftPercent ?? 0.5}
                        maximumValue={1}
                        onValueChange={val => {
                            if (showStatusBarLyric) {
                                LyricUtil.setStatusBarLyricLeft(val);
                            }
                        }}
                        onSlidingComplete={val => {
                            Config.setConfig("lyric.leftPercent", val);
                        }}
                    />
                </View>
                <View style={lyricStyles.sliderContainer}>
                    <ThemeText>{t("basicSettings.lyric.topBottomDistance")}</ThemeText>
                    <Slider
                        style={lyricStyles.slider}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.text ?? "#999999"}
                        thumbTintColor={colors.primary}
                        minimumValue={0}
                        value={topPercent ?? 0}
                        step={0.001}
                        maximumValue={1}
                        onValueChange={val => {
                            if (showStatusBarLyric) {
                                LyricUtil.setStatusBarLyricTop(val);
                            }
                        }}
                        onSlidingComplete={val => {
                            Config.setConfig("lyric.topPercent", val);
                        }}
                    />
                </View>
                <View style={lyricStyles.sliderContainer}>
                    <ThemeText>{t("basicSettings.lyric.width")}</ThemeText>
                    <Slider
                        style={lyricStyles.slider}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.text ?? "#999999"}
                        thumbTintColor={colors.primary}
                        minimumValue={0.3}
                        step={0.001}
                        value={widthPercent ?? 0.5}
                        maximumValue={1}
                        onValueChange={val => {
                            if (showStatusBarLyric) {
                                LyricUtil.setStatusBarLyricWidth(val);
                            }
                        }}
                        onSlidingComplete={val => {
                            Config.setConfig("lyric.widthPercent", val);
                        }}
                    />
                </View>
                <View style={lyricStyles.sliderContainer}>
                    <ThemeText>{t("basicSettings.lyric.fontSize")}</ThemeText>
                    <Slider
                        style={lyricStyles.slider}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.text ?? "#999999"}
                        thumbTintColor={colors.primary}
                        minimumValue={Math.round(rpx(18))}
                        step={0.5}
                        maximumValue={Math.round(rpx(56))}
                        value={fontSize ?? Math.round(rpx(24))}
                        onValueChange={val => {
                            if (showStatusBarLyric) {
                                LyricUtil.setStatusBarLyricFontSize(val);
                            }
                        }}
                        onSlidingComplete={val => {
                            Config.setConfig("lyric.fontSize", val);
                        }}
                    />
                </View>
                <ListItem
                    withHorizontalPadding
                    heightType="small"
                    onPress={alignStatusBarLyric.onPress}>
                    <ListItem.Content title={alignStatusBarLyric.title}/>
                    {alignStatusBarLyric.right}
                </ListItem>
                <ListItem
                    withHorizontalPadding
                    heightType="small"
                >
                    <ListItem.Content title={t("basicSettings.lyric.textColor")}/>
                    <ColorSelect
                        style={lyricStyles.slider}
                        color={color ?? "#FFE9D2FF"}
                        onSelect={(color) => {
                            console.log(color)
                            if (showStatusBarLyric) {
                                LyricUtil.setStatusBarColors(color, null);
                                Config.setConfig("lyric.color", color);
                            }
                        }}/>
                </ListItem>
                <ListItem
                    withHorizontalPadding
                    heightType="small"
                >
                    <ListItem.Content title={t("basicSettings.lyric.backgroundColor")}/>
                    <ColorSelect
                        color={backgroundColor ?? "#84888153"}
                        options={basicColorValues.map(rgb => {
                            return getBackgroundColor(rgb).hexa();
                        })}
                        onSelect={(color, isCustom) => {
                            if (showStatusBarLyric) {
                                LyricUtil.setStatusBarColors(null, color);
                                Config.setConfig(
                                    "lyric.backgroundColor",
                                    color,
                                );
                            }
                            if (isCustom) {
                                showPanel("LyricSettingPanel");
                            }
                        }}
                    />
                </ListItem>
            </View>
            }
        </View>
    );
}

const lyricStyles = StyleSheet.create({
    slider: {
        flex: 1,
        marginLeft: rpx(24),
    },
    sliderContainer: {
        height: rpx(96),
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(24),
    },
});
