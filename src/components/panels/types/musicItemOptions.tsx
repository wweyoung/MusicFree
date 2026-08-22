import React from "react";
import {StyleSheet, View} from "react-native";
import rpx from "@/utils/rpx";
import ListItem from "@/components/base/listItem";
import ThemeText from "@/components/base/themeText";
import {ImgAsset} from "@/constants/assetsConst";
import Clipboard from "@react-native-clipboard/clipboard";

import {getMediaUniqueKey} from "@/utils/mediaUtils";
import FastImage from "@/components/base/fastImage";
import Toast from "@/utils/toast";
import LocalMusicSheet from "@/core/localMusicSheet";
import {localMusicSheetId, musicHistorySheetId} from "@/constants/commonConst";
import {ROUTE_PATH, useNavigate} from "@/core/router";

import {useSafeAreaInsets} from "react-native-safe-area-context";
import PanelBase from "../base/panelBase";
import {FlatList, TouchableOpacity} from "react-native-gesture-handler";
import musicHistory from "@/core/musicHistory";
import {showDialog} from "@/components/dialogs/useDialog";
import {hidePanel, showPanel} from "../usePanel";
import Divider from "@/components/base/divider";
import {iconSizeConst} from "@/constants/uiConst";
import Config from "@/core/appConfig";
import TrackPlayer, {useCurrentMusic} from "@/core/trackPlayer";
import mediaCache from "@/core/mediaCache";
import Icon, {IIconName} from "@/components/base/icon.tsx";
import MusicSheet from "@/core/musicSheet";
import downloader from "@/core/downloader";
import {getMediaExtraProperty} from "@/utils/mediaExtra";
import lyricManager from "@/core/lyricManager";
import {useI18N} from "@/core/i18n";
import pluginManager from "@/core/pluginManager";
import PersistStatus from "@/utils/persistStatus";
import copyText from "@/utils/copyText";
import LyricUtil from "@/native/lyricUtil";
import {getDocumentAsync} from "expo-document-picker";
import {readAsStringAsync} from "expo-file-system";
import useColors from "@/hooks/useColors";
import {useScheduleCloseCountDown} from "@/utils/scheduleClose";
import timeformat from "@/utils/timeformat";

interface IMusicItemOptionsProps {
    /** 歌曲信息 */
    musicItem: IMusic.IMusicItem;
    /** 歌曲所在歌单 */
    musicSheet?: IMusic.IMusicSheetItem;
    /** 来源 */
    from?: string;

    type: 'music' | 'lyric'
}

const ITEM_HEIGHT = rpx(96);

export interface IMusicItemOption {
    icon: IIconName;
    title: string;
    value?: any;
    onPress?: () => void;
    show?: boolean;
    onLongPress?: () => void;
    showCard?: boolean;
}

export function useMusicItemOptions(props: IMusicItemOptionsProps) {
    const {musicItem, musicSheet, from, type} = props ?? {};
    const {t} = useI18N();
    const downloaded = LocalMusicSheet.isLocalMusic(musicItem);
    const associatedLrc = getMediaExtraProperty(musicItem, "associatedLrc");
    const navigate = useNavigate();
    const rate = PersistStatus.useValue("music.rate", 100);
    const currentMusic = useCurrentMusic();
    const countDown = useScheduleCloseCountDown();
    const isCurrentMusic = musicItem.id === currentMusic?.id && musicItem.platform === currentMusic.platform;
    const isShowStatusBarLyric = Config.getConfig("lyric.showStatusBarLyric");

    const options: IMusicItemOption[] = [
        {
            icon: "identification",
            title: `ID: ${getMediaUniqueKey(musicItem)}`,
            onPress: () => {
                mediaCache.setMediaCache(musicItem);
                copyText(
                    JSON.stringify(
                        {
                            platform: musicItem.platform,
                            id: musicItem.id,
                        },
                        null,
                        "",
                    ),
                );
                Toast.success(t("toast.copiedToClipboard"));
            },
        },
        {
            icon: "user",
            title: t("panel.musicItemOptions.author", {artist: musicItem.artist}),
            onPress: () => {
                hidePanel();
                // const plugin = pluginManager.getByMedia(musicItem);
                // if (plugin?.supportedMethods.has("getArtistWorks")) {
                // todo 等音乐可以获取到歌手id等信息后直接跳转到歌手页
                // navigate(ROUTE_PATH.ARTIST_DETAIL, {
                //     artistItem: musicItem.artist,
                //     pluginHash: plugin?.hash,
                // });
                // } else {
                navigate(ROUTE_PATH.SEARCH_PAGE, {type: "artist", query: musicItem.artist});
                // }
            },
            onLongPress: () => copyText(musicItem.artist),
        },
        {
            icon: "album-outline",
            show: !!musicItem.album,
            title: t("panel.musicItemOptions.album", {album: musicItem.album}),
            onPress: () => {
                hidePanel();
                navigate(ROUTE_PATH.SEARCH_PAGE, {type: "album", query: musicItem.album});
            },
            onLongPress: () => copyText(musicItem.album),
        },
        {
            icon: "motion-play",
            title: t("musicListEditor.addToNextPlay"),
            show: !isCurrentMusic,
            showCard: true,
            onPress: () => {
                TrackPlayer.addNext(musicItem);
                hidePanel();
                Toast.success(t("toast.addToNextPlay"));
            },
        },
        {
            icon: "folder-plus",
            title: t("musicListEditor.addToSheet"),
            showCard: true,
            onPress: () => {
                showPanel("AddToMusicSheet", {musicItem});
            },
        },
        {
            icon: "arrow-up-tray",
            title: t("panel.musicItemOptions.uploadToPlugin"),
            show: type === 'music',
            showCard: true,
            onPress: async () => {
                console.log(musicItem);
                showPanel("MusicQuality", {
                    musicItem,
                    type: "upload",
                    async onQualityPress(quality) {
                        showPanel("UploadMusicItem", {musicItem, quality});
                    },
                });
            },
        },
        {
            icon: "arrow-down-tray",
            title: t("common.download"),
            show: !downloaded && type === 'music',
            showCard: true,
            onPress: async () => {
                showPanel("MusicQuality", {
                    musicItem,
                    type: "download",
                    async onQualityPress(quality) {
                        downloader.download(musicItem, quality);
                    },
                });
            },
        },
        {
            icon: "check-circle-outline",
            title: t("panel.musicItemOptions.downloaded"),
            show: !!downloaded && type === 'music',
        },
        {
            icon: "trash-outline",
            title: t("common.delete"),
            show: !!musicSheet && type === 'music',
            showCard: true,
            onPress: async () => {
                if (musicSheet?.id === localMusicSheetId) {
                    await LocalMusicSheet.removeMusic(musicItem);
                } else if (musicSheet?.id === musicHistorySheetId) {
                    await musicHistory.removeMusic(musicItem);
                } else {
                    await MusicSheet.removeMusic(musicSheet!.id, musicItem);
                }
                Toast.success(t("toast.deleteSuccess"));
                hidePanel();
            },
        },
        {
            icon: "trash-outline",
            title: t("panel.musicItemOptions.deleteLocalDownload"),
            show: !!downloaded && type === 'music',
            onPress: () => {
                showDialog("SimpleDialog", {
                    title: t("panel.musicItemOptions.deleteLocalDownload"),
                    content: t("panel.musicItemOptions.deleteLocalDownloadConfirm"),
                    async onOk() {
                        try {
                            await LocalMusicSheet.removeMusic(musicItem, true);
                            Toast.success(t("toast.deleteSuccess"));
                        } catch (e: any) {
                            Toast.warn(`${t("panel.musicItemOptions.deleteFailed")} ${e?.message ?? e}`);
                        }
                    },
                });
                hidePanel();
            },
        },
        {
            icon: "chat-bubble-oval-left-ellipsis",
            title: t("panel.musicItemOptions.readComment"),
            show: isCurrentMusic && type === 'music' && !!pluginManager.getByMedia(musicItem)?.supportedMethods.has("getMusicComments"),
            showCard: true,
            onPress: () => {
                if (!musicItem) {
                    return;
                }
                showPanel("MusicComment", {
                    musicItem: musicItem,
                });
            },
        },
        {
            icon: "link",
            title: associatedLrc
                ? t("panel.musicItemOptions.associatedLyric", {platform: associatedLrc.platform, id: associatedLrc.id})
                : t("panel.musicItemOptions.associateLyric"),
            show: type === 'lyric',
            showCard: true,
            onPress: async () => {
                if (
                    Config.getConfig("basic.associateLyricType") === "input"
                ) {
                    showPanel("AssociateLrc", {
                        musicItem,
                    });
                } else {
                    showPanel("SearchLrc", {
                        musicItem,
                    });
                }
            },
        },
        {
            icon: "link-slash",
            title: t("panel.musicItemOptions.unassociateLyric"),
            show: !!associatedLrc && type === 'lyric',
            showCard: true,
            onPress: async () => {
                lyricManager.unassociateLyric(musicItem);
                Toast.success(t("panel.musicItemOptions.unassociateLyricSuccess"));
                hidePanel();
            },
        },
        {
            icon: "alarm-outline",
            title: t("panel.musicItemOptions.timingClose"),
            show: from === ROUTE_PATH.MUSIC_DETAIL && type === 'lyric',
            showCard: true,
            onPress: () => {
                showPanel("TimingClose");
            },
        },
        {
            icon: "play-rate",
            title: t("panel.playRate.title"),
            value: (rate / 100) + 'X',
            show: isCurrentMusic && type === 'music',
            showCard: true,
            onPress: () => {
                showPanel("PlayRate", {
                    async onRatePress(newRate) {
                        if (rate !== newRate) {
                            try {
                                await TrackPlayer.setRate(newRate / 100);
                                PersistStatus.set("music.rate", newRate);
                            } catch {
                            }
                        }
                    },
                });
            },
        },
        {
            icon: "alarm-outline",
            title: t("sidebar.scheduleClose"),
            value: countDown ? timeformat(countDown) : "",
            show: isCurrentMusic && type === 'music',
            showCard: true,
            onPress: () => {
                showPanel("TimingClose");
            },
        },
        {
            icon: "archive-box-x-mark",
            title: t("panel.musicItemOptions.clearPluginCache"),
            show: isCurrentMusic && type === 'music',
            onPress: () => {
                mediaCache.removeMediaCache(musicItem);
                Toast.success(t("panel.musicItemOptions.cacheCleared"));
            },
        },
        {
            icon: isShowStatusBarLyric ? "lyric-close" : "lyric",
            title: t("panel.musicItemLyricOptions.toggleDesktopLyric", {
                status: isShowStatusBarLyric
                    ? t("panel.musicItemLyricOptions.disableDesktopLyric")
                    : t("panel.musicItemLyricOptions.enableDesktopLyric"),
            }),
            show: type === 'lyric',
            showCard: true,
            async onPress() {
                if (!isShowStatusBarLyric) {
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
                            Toast.warn(t("panel.musicItemLyricOptions.desktopLyricPermissionError"));
                        });
                    }
                } else {
                    LyricUtil.hideStatusBarLyric();
                    Config.setConfig("lyric.showStatusBarLyric", false);
                }
                hidePanel();
            },
        },
        {
            icon: "magnifying-glass",
            title: t("lyric.searchLyric"),
            show: type === 'lyric',
            showCard: true,
            async onPress() {
                const currentMusic = TrackPlayer.currentMusic;
                if (!currentMusic) {
                    return;
                }
                // if (
                //     Config.get('setting.basic.associateLyricType') ===
                //     'input'
                // ) {
                //     showPanel('AssociateLrc', {
                //         musicItem: currentMusic,
                //     });
                // } else {
                showPanel("SearchLrc", {
                    musicItem: currentMusic,
                });
                // }
            },
        },
        {
            icon: "arrow-up-tray",
            title: t("panel.musicItemLyricOptions.uploadLyric"),
            show: type === 'lyric',
            showCard: true,
            async onPress() {
                showPanel("SimpleSelect", {
                    header: t("panel.musicItemLyricOptions.uploadLyric"),
                    candidates: [
                        {
                            value: 'raw',
                            title: t("panel.musicItemLyricOptions.uploadLocalLyric"),
                        },
                        {
                            value: 'translation',
                            title: t("panel.musicItemLyricOptions.uploadLocalLyricTranslation"),
                        }
                    ],
                    async onPress(value) {
                        try {
                            const result = await getDocumentAsync({
                                copyToCacheDirectory: true,
                            });
                            if (result.canceled) {
                                return;
                            }
                            const pickedDoc = result.assets[0].uri;
                            const lyricContent = await readAsStringAsync(pickedDoc, {
                                encoding: "utf8",
                            });
                            await lyricManager.uploadLocalLyric(musicItem, lyricContent, value);
                            Toast.success(t("toast.settingSuccess"));
                            hidePanel();
                        } catch (e: any) {
                            console.log(e);
                            Toast.warn(t("panel.musicItemLyricOptions.settingFail", {
                                reason: e?.message,
                            }));
                        }
                    },
                });
            },
        },
        {
            icon: "trash-outline",
            title: t("panel.musicItemLyricOptions.deleteLocalLyric"),
            show: type === 'lyric',
            async onPress() {
                try {
                    lyricManager.removeLocalLyric(musicItem);
                    hidePanel();
                } catch (e: any) {
                    console.log(e);
                    Toast.warn(t("panel.musicItemLyricOptions.deleteFail", {
                        reason: e?.message,
                    }));
                }
            },
        },
    ];
    const result = {
        cards: [],
        list: []
    }
    for (let option of options) {
        if (option.show === false) {
            continue;
        }
        if (option.showCard && result.cards.length < 5) {
            result.cards.push(option);
        } else {
            result.list.push(option);
        }
    }
    return result;
}

export default function MusicItemOptions(props: IMusicItemOptionsProps) {
    const {musicItem} = props ?? {};

    const safeAreaInsets = useSafeAreaInsets();
    const navigate = useNavigate();
    const colors = useColors();
    const {cards, list}: IMusicItemOption[] = useMusicItemOptions(props);

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
                            <ThemeText numberOfLines={2} style={style.title} onPress={
                                () => {
                                    hidePanel();
                                    navigate(ROUTE_PATH.SEARCH_PAGE, {type: "music", query: musicItem?.title});
                                }
                            }
                                       onLongPress={() => copyText(musicItem?.title)}
                            >
                                {musicItem?.title}
                            </ThemeText>
                            <ThemeText
                                fontColor="textSecondary"
                                numberOfLines={2}
                                fontSize="description">
                                {musicItem?.artist}{" "}
                                {musicItem?.album ? `- ${musicItem.album}` : ""}
                            </ThemeText>
                        </View>
                    </View>
                    <Divider/>
                    <View style={style.wrapper}>
                        <FlatList
                            data={list}
                            getItemLayout={(_, index) => ({
                                length: ITEM_HEIGHT,
                                offset: ITEM_HEIGHT * index,
                                index,
                            })}
                            ListHeaderComponent={
                                <View style={style.cardsContainer}>
                                    {cards.map(item => {
                                        return (
                                            <TouchableOpacity
                                                key={item.title}
                                                onPress={item.onPress}
                                                onLongPress={item.onLongPress}
                                                style={[style.card]}>
                                                <View style={[style.cardIcon, {
                                                    backgroundColor: colors.border
                                                }]}>
                                                    <Icon
                                                        accessible={false}
                                                        name={item.icon}
                                                        color={colors.text}
                                                        size={iconSizeConst.big}
                                                    />
                                                </View>
                                                <ThemeText
                                                    fontSize="subTitle"
                                                    numberOfLines={3}
                                                    style={[style.cardText]}
                                                >
                                                    {item.title}
                                                </ThemeText>
                                                {item.value && <ThemeText
                                                    fontSize="subTitle"
                                                    numberOfLines={1}
                                                    style={[style.cardText]}
                                                >
                                                    {item.value}
                                                </ThemeText>}
                                            </TouchableOpacity>
                                        )
                                    })
                                    }
                                </View>
                            }
                            ListFooterComponent={<View style={style.footer}/>}
                            style={[
                                style.listWrapper,
                                {
                                    marginBottom: safeAreaInsets.bottom,
                                },
                            ]}
                            keyExtractor={_ => _.title}
                            renderItem={({item}) =>
                                item.show !== false ? (
                                    <ListItem
                                        withHorizontalPadding
                                        heightType="small"
                                        onPress={item.onPress}
                                        onLongPress={item.onLongPress}>
                                        <ListItem.ListItemIcon
                                            width={rpx(48)}
                                            icon={item.icon}
                                            iconSize={iconSizeConst.light}
                                        />
                                        <ListItem.Content
                                            title={`${item.title}${item.value ? ` : ${item.value}` : ''}`}/>
                                    </ListItem>
                                ) : null
                            }
                        />
                    </View>
                </>
            )}
        />
    )
        ;
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
    cardsContainer: {
        flexDirection: "row",
        paddingHorizontal: rpx(30),
        marginVertical: rpx(20),
        width: '100%',
        maxWidth: '100%',
        justifyContent: "space-between",
    },
    card: {
        flex: 1,
        alignItems: "center",
        maxWidth: rpx(140),
    },
    cardIcon: {
        padding: rpx(24),
        borderRadius: rpx(24),
        marginBottom: rpx(12),
    },
    cardText: {
        textAlign: 'center'
    }
});
