import React from "react";
import {Pressable, StyleSheet, View} from "react-native";
import rpx from "@/utils/rpx";
import ColorBlock from "@/components/base/colorBlock";
import {showPanel} from "@/components/panels/usePanel";
import {basicColorValues} from "@/core/theme";
import useColors from "@/hooks/useColors";
import Color from "color";

interface IColorSelectProps {
    color?: string;
    options?: string[];
    custom?: boolean;
    limit?: number;
    onSelect?: (color:string, isCustom:boolean) => {}
}

const noneColor = "#00000000"

export default function ColorSelect(props: IColorSelectProps) {
    const {color, options = basicColorValues ?? [], custom = true, onSelect, limit = 6} = props;
    let showOptions = options;
    if (limit > 0) {
        showOptions = options.slice(0, limit);
    }
    const colors = useColors();
    let selectIndex = color ? showOptions?.findIndex((option) => option && Color(option).hexa() === Color(color as string).hexa()) : -1;
    if (custom) {
        showOptions = [...showOptions, ''];
    }
    if (selectIndex < 0 && custom) selectIndex = showOptions.length - 1;
    return (
        <View style={[styles.container]}>
            {showOptions?.map((option, index) => {
                const isSelected = index === selectIndex;
                return (
                <Pressable key={index} onPress={() => {
                    if (custom && (isSelected || !option)) {
                        showPanel("ColorPicker", {
                            closePanelWhenSelected: true,
                            defaultColor: color,
                            selectOptions: options,
                            onSelected(color) {
                                onSelect?.(color.hexa().toString(), custom)
                            },
                        })
                    } else {
                        onSelect?.(option, false)
                    }
                }} style={[styles.options,
                    isSelected ? [styles.selected, {borderColor: colors.primary}] : {borderColor: colors.divider}]}>
                    <ColorBlock color={option || color} barStyle={styles.barStyle} isShowLinear={!option}/>
                </Pressable>
            )})}
        </View>
    );

}

const styles = StyleSheet.create(
    {
        scrollView: {
            flex: 1,
            width: "100%"
        },
        container: {
            flexDirection: "row",
            gap: rpx(8),
        },
        options: {
            alignSelf: "center",
            alignContent: "center",
            verticalAlign: "middle",
            borderWidth: 1,
            padding: 1,
            borderStyle: "solid",
            borderRadius: rpx(8)
        },
        selected: {
            padding: 0,
            borderWidth: 2,
        },
        barStyle: {
            width: rpx(50),
            borderColor: noneColor
        }
    }
);
