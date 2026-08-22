import FastImage from "@/components/base/fastImage";
import ListItem from "@/components/base/listItem";
import ThemeText from "@/components/base/themeText";
import {ImgAsset} from "@/constants/assetsConst";
import {getMediaUniqueKey} from "@/utils/mediaUtils";
import rpx from "@/utils/rpx";
import Toast from "@/utils/toast";
import Clipboard from "@react-native-clipboard/clipboard";
import React from "react";
import {StyleSheet, View} from "react-native";

import Divider from "@/components/base/divider";
import {IIconName} from "@/components/base/icon.tsx";
import {hidePanel, showPanel} from "@/components/panels/usePanel.ts";
import {iconSizeConst} from "@/constants/uiConst";
import Config from "@/core/appConfig";
import lyricManager from "@/core/lyricManager";
import mediaCache from "@/core/mediaCache";
import LyricUtil from "@/native/lyricUtil";
import {getDocumentAsync} from "expo-document-picker";
import {readAsStringAsync} from "expo-file-system";
import {FlatList} from "react-native-gesture-handler";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import PanelBase from "../base/panelBase";
import {useI18N} from "@/core/i18n";
import TrackPlayer from "@/core/trackPlayer";
import {IMusicItemOption, useMusicItemOptions} from "@/components/panels/types/musicItemOptions";

interface IMusicItemLyricOptionsProps {
    /** 歌曲信息 */
    musicItem: IMusic.IMusicItem;
}

const ITEM_HEIGHT = rpx(96);

/**
 *
 * @param props
 * @constructor
 * @deprecated 使用musicItemOptions替代
 */
export default function MusicItemLyricOptions(
    props: IMusicItemLyricOptionsProps,
) {
    const { musicItem } = props ?? {};

    const safeAreaInsets = useSafeAreaInsets();
    const { t } = useI18N();

    const options: IMusicItemOption[] = useMusicItemOptions({
        ...this.props,
        type: 'lyric'
    });

    return (
        <PanelBase
            renderBody={() => (
                <>
                    <View style={style.header}>
                        <FastImage
                            style={style.artwork}
                            source={musicItem?.artwork}
                            placeholderSource={ImgAsset.albumDefault}
                        />
                        <View style={style.content}>
                            <ThemeText numberOfLines={2} style={style.title}>
                                {musicItem?.title}
                            </ThemeText>
                            <ThemeText
                                fontColor="textSecondary"
                                fontSize="description"
                                numberOfLines={2}>
                                {musicItem?.artist}{" "}
                                {musicItem?.album ? `- ${musicItem.album}` : ""}
                            </ThemeText>
                        </View>
                    </View>
                    <Divider />
                    <View style={style.wrapper}>
                        <FlatList
                            data={options}
                            getItemLayout={(_, index) => ({
                                length: ITEM_HEIGHT,
                                offset: ITEM_HEIGHT * index,
                                index,
                            })}
                            ListFooterComponent={<View style={style.footer} />}
                            style={[
                                style.listWrapper,
                                {
                                    marginBottom: safeAreaInsets.bottom,
                                },
                            ]}
                            keyExtractor={_ => _.title}
                            renderItem={({ item }) =>
                                item.show !== false ? (
                                    <ListItem
                                        withHorizontalPadding
                                        heightType="small"
                                        onPress={item.onPress}>
                                        <ListItem.ListItemIcon
                                            width={rpx(48)}
                                            icon={item.icon}
                                            iconSize={iconSizeConst.light}
                                        />
                                        <ListItem.Content title={item.title} />
                                    </ListItem>
                                ) : null
                            }
                        />
                    </View>
                </>
            )}
        />
    );
}

const style = StyleSheet.create({
    wrapper: {
        width: rpx(750),
        flex: 1,
    },
    header: {
        width: rpx(750),
        height: rpx(200),
        flexDirection: "row",
        padding: rpx(24),
    },
    listWrapper: {
        paddingTop: rpx(12),
    },
    artwork: {
        width: rpx(140),
        height: rpx(140),
        borderRadius: rpx(16),
    },
    content: {
        marginLeft: rpx(36),
        width: rpx(526),
        height: rpx(140),
        justifyContent: "space-around",
    },
    title: {
        paddingRight: rpx(24),
    },
    footer: {
        width: rpx(750),
        height: rpx(30),
    },
});
