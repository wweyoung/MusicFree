import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import rpx from "@/utils/rpx";
import ThemeText from "@/components/base/themeText";

import PanelBase from "../base/panelBase";
import Slider from "@react-native-community/slider";
import useColors from "@/hooks/useColors";
import PanelHeader from "../base/panelHeader";
import {useI18N} from "@/core/i18n";
import ListItem from "@/components/base/listItem";
import {createRadio} from "@/utils/componentUtil";
import {NativeTextAlignment} from "@/native/lyricUtil";
import PersistStatus from "@/utils/persistStatus";

interface IProps {
    defaultSelect?: number;
    /** 点击回调 */
    onSelectChange: (value: number) => void;
}

export default function SetFontSize(props: IProps) {
    const {defaultSelect, onSelectChange} = props ?? {};
    const colors = useColors();
    const {t} = useI18N();
    const [selected, setSelected] = useState(defaultSelect ?? 1);
    const textAlign = PersistStatus.useValue("lyric.detailTextAlign", 'center');

    const textAlignRadio = createRadio(
        t("basicSettings.lyric.align"),
        "lyric.detailTextAlign",
        ['left', 'center'],
        textAlign ?? NativeTextAlignment.CENTER,
        {
            left: t("basicSettings.lyric.align.left"),
            center: t("basicSettings.lyric.align.center"),
        },
        newVal => {
            PersistStatus.set("lyric.detailTextAlign", newVal as string)
        },
    );
    const fontSizeLabels = [t("panel.setFontSize.small"), t("panel.setFontSize.standard"),
        t("panel.setFontSize.large"), t("panel.setFontSize.extraLarge")
    ]
    return (
        <PanelBase
            height={rpx(520)}
            keyboardAvoidBehavior="none"
            renderBody={() => (
                <>
                    <PanelHeader title={t("panel.setFontSize.title")} hideButtons/>
                    <View style={styles.container}>
                        <ListItem
                            withHorizontalPadding
                            heightType="small"
                            onPress={textAlignRadio.onPress}>
                            <ListItem.Content title={textAlignRadio.title}/>
                            {textAlignRadio.right}
                        </ListItem>
                        <View style={styles.sliderContainer}>
                            <ThemeText>{t("basicSettings.lyric.fontSize")}</ThemeText>
                            <View style={{flex: 1}}>
                                <Slider
                                    style={styles.slider}
                                    thumbTintColor={colors.primary}
                                    minimumTrackTintColor={colors.primary}
                                    value={selected}
                                    step={1}
                                    onValueChange={val => {
                                        setSelected(val);
                                        PersistStatus.set("lyric.detailFontSize", val);
                                        onSelectChange?.(val);
                                    }}
                                    minimumValue={0}
                                    maximumValue={3}
                                />
                                <View style={styles.labelsContainer}>
                                    {fontSizeLabels.map((label, index) => (
                                        <ThemeText key={index}
                                                   style={[styles.label, {left: `${index * 100 / (fontSizeLabels.length - 1)}%`}]}>
                                            {label}
                                        </ThemeText>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </>
            )}
        />
    );
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        flexDirection: "row",
        padding: rpx(24),
    },
    container: {
        flex: 1,
        paddingHorizontal: rpx(24),
        width: "100%",
        marginTop: rpx(88),
        gap: rpx(20)
    },
    slider: {
        flex: 1,
    },
    sliderContainer: {
        height: rpx(96),
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        verticalAlign: "top",
        paddingHorizontal: rpx(24),
    },
    labelsContainer: {
        flex: 1,
        marginHorizontal: rpx(30)
    },
    label: {
        position: "absolute",
        textAlign: "center",
        opacity: 0.5,
        width: rpx(70),
        transform: [{translateX: -rpx(35)}]
    }
});
