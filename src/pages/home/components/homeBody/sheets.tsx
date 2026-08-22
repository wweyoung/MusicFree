import Empty from "@/components/base/empty";
import IconButton from "@/components/base/iconButton";
import ListItem from "@/components/base/listItem";
import ThemeText from "@/components/base/themeText";
import {showDialog} from "@/components/dialogs/useDialog";
import {showPanel} from "@/components/panels/usePanel";
import {ImgAsset} from "@/constants/assetsConst";
import {localPluginPlatform} from "@/constants/commonConst";
import i18n, {useI18N} from "@/core/i18n";
import MusicSheet, {useSheetsBase, useStarredSheets} from "@/core/musicSheet";
import {ROUTE_PATH, useNavigate} from "@/core/router";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import Toast from "@/utils/toast";
import {FlashList} from "@shopify/flash-list";
import React, {useMemo, useRef, useState} from "react";
import {ActivityIndicator, StyleSheet, View} from "react-native";
import {Pressable} from "react-native-gesture-handler";
import Tag from "@/components/base/tag";
import Icon from "@/components/base/icon";
import {fontSizeConst, iconSizeConst} from "@/constants/uiConst";
import TrackPlayer, {useCurrentSheet, useMusicState} from "@/core/trackPlayer";
import {musicIsBuffering, musicIsPaused} from "@/utils/trackUtils";
import usePluginSheetMusicList from "@/pages/pluginSheetDetail/hooks/usePluginSheetMusicList";
import PluginManager from "@/core/pluginManager";
import {getDefaultStore} from "jotai";
import useOrientation from "@/hooks/useOrientation";

export default function Sheets() {
    const [index, setIndex] = useState(0);
    let [loadingSheet, setLoadingSheet] = useState<IMusic.IMusicSheetItemBase | undefined>(undefined);
    const loadingSheetRef = useRef<IMusic.IMusicSheetItemBase | undefined>(undefined);


    const colors = useColors();
    const navigate = useNavigate();

    const allSheets = useSheetsBase();
    const staredSheets = useStarredSheets();
    const currentSheet = useCurrentSheet();
    const musicState = useMusicState();
    const orientation = useOrientation();

    const {t} = useI18N();
    const selectedTabTextStyle = useMemo(() => {
        return [
            styles.selectTabText,
            {
                borderBottomColor: colors.primary,
            },
        ];
    }, [colors]);
    const [pressingSheet, setPressingSheet] = useState<IMusic.IMusicSheetItem | undefined>(undefined);
    const pressingTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    return (
        <>
            <View style={styles.subTitleContainer}>
                <Pressable
                    style={styles.tabContainer}
                    accessible
                    accessibilityLabel={t("home.myPlaylistsCount.a11y", {
                        count: allSheets.length,
                    })}
                    onPress={() => {
                        setIndex(0);
                    }}>
                    <ThemeText
                        accessible={false}
                        fontSize="title"
                        style={[
                            styles.tabText,
                            index === 0 ? selectedTabTextStyle : null,
                        ]}>
                        {t("home.myPlaylists")}
                    </ThemeText>
                    <ThemeText
                        accessible={false}
                        fontColor="textSecondary"
                        fontSize="subTitle"
                        style={styles.tabText}>
                        {" "}
                        ({allSheets.length})
                    </ThemeText>
                </Pressable>
                <Pressable
                    style={styles.tabContainer}
                    accessible
                    accessibilityLabel={t("home.starredPlaylistsCount.a11y", {
                        count: allSheets.length,
                    })}
                    onPress={() => {
                        setIndex(1);
                    }}>
                    <ThemeText
                        fontSize="title"
                        accessible={false}
                        style={[
                            styles.tabText,
                            index === 1 ? selectedTabTextStyle : null,
                        ]}>
                        {t("home.starredPlaylists")}
                    </ThemeText>
                    <ThemeText
                        fontColor="textSecondary"
                        fontSize="subTitle"
                        accessible={false}
                        style={styles.tabText}>
                        {" "}
                        ({staredSheets.length})
                    </ThemeText>
                </Pressable>
                <View style={styles.more}>
                    <IconButton
                        name="plus"
                        style={styles.newSheetButton}
                        sizeType="normal"
                        accessibilityLabel={t("home.newPlaylist.a11y")}
                        onPress={() => {
                            showPanel("CreateMusicSheet");
                        }}
                    />
                    <IconButton name='ellipsis-vertical' sizeType="normal" onPress={() => {
                        showPanel("SimpleSelect", {
                            header: i18n.t("home.playlistManagement.a11y"),
                            height: rpx(360),
                            candidates: [{
                                title: i18n.t("home.managePlaylists.a11y"),
                                icon: "pencil-square",
                                value: "manageSheets",
                            }, {
                                title: i18n.t("home.importPlaylist.a11y"),
                                icon: "inbox-arrow-down",
                                value: "importSheets",
                            }],
                            onPress(item) {
                                if (item.value === "manageSheets") {
                                    navigate(ROUTE_PATH.SHEET_EDITOR, {
                                        sheetType: index === 0 ? "local" : "starred",
                                    });
                                } else if (item.value === "importSheets") {
                                    showPanel("ImportMusicSheet");
                                }
                            },
                        });
                    }}/>
                </View>
            </View>
            <FlashList
                ListEmptyComponent={<Empty/>}
                extraData={{t}}
                data={(index === 0 ? allSheets : staredSheets) ?? []}
                estimatedItemSize={ListItem.Size.big}
                numColumns={orientation === 'vertical' ? 1 : 2}
                renderItem={({item}) => {
                    const sheet = item as IMusic.IMusicSheetItem;
                    const isLocalSheet = !(
                        sheet.platform && sheet.platform !== localPluginPlatform
                    );
                    return (
                        <ListItem
                            key={`${sheet.id}`}
                            heightType="big"
                            withHorizontalPadding
                            onPress={() => {
                                if (isLocalSheet) {
                                    navigate(ROUTE_PATH.LOCAL_SHEET_DETAIL, {
                                        id: sheet.id,
                                    });
                                } else {
                                    navigate(ROUTE_PATH.PLUGIN_SHEET_DETAIL, {
                                        sheetInfo: sheet,
                                    });
                                }
                            }}
                            onLongPress={() => {
                                clearTimeout(pressingTimerRef.current);
                                setPressingSheet(sheet)
                                pressingTimerRef.current = setTimeout(() => {
                                    setPressingSheet(undefined);
                                }, 2000)
                            }}
                        >
                            <ListItem.ListItemImage
                                uri={sheet.coverImg ?? sheet.artwork}
                                fallbackImg={ImgAsset.albumDefault}
                                onPress={async (e) => {
                                    if (currentSheet?.id === sheet.id && currentSheet?.platform === sheet.platform && TrackPlayer.playList?.length > 0) {
                                        if (musicIsPaused(musicState)) {
                                            TrackPlayer.play();
                                        } else {
                                            TrackPlayer.pause();
                                        }
                                        return;
                                    }

                                    // 播放
                                    if (isLocalSheet) {
                                        const sortedMusicList = MusicSheet.getSortedMusicListBySheetId(sheet.id);
                                        TrackPlayer.playPlayList(sortedMusicList.musicList, sheet);
                                    } else {
                                        setLoadingSheet(sheet);
                                        loadingSheetRef.current = sheet;
                                        console.log(loadingSheet, sheet.id)
                                        await PluginManager.getByMedia(sheet)?.methods?.getMusicSheetInfo?.(
                                            sheet, 0)
                                            .then(result => {
                                                if (!result) {
                                                    // throw new Error();
                                                    return;
                                                }
                                                loadingSheet = loadingSheetRef.current;
                                                console.log(loadingSheet, sheet.id)
                                                if (loadingSheet?.id === sheet.id && loadingSheet?.platform === sheet.platform) {
                                                    TrackPlayer.playPlayList(result?.musicList, sheet);
                                                }
                                            })
                                            .catch(e => {
                                                Toast.warn(i18n.t("common.failToLoad"));
                                            })
                                            .finally(() => {
                                                setLoadingSheet(undefined);
                                                loadingSheetRef.current = undefined;
                                            });
                                    }

                                }}
                            >
                                {sheet.id === MusicSheet.defaultSheet.id &&
                                <Icon
                                    name="heart"
                                    size={iconSizeConst.normal}
                                    color="red"
                                    style={styles.maskIcon}
                                />
                                }
                                <View style={[styles.maskIcon, styles.playSheet, {
                                    backgroundColor: colors.card,
                                }]}>
                                    {(loadingSheet?.id === sheet.id && loadingSheet?.platform === sheet.platform) || (currentSheet?.id === sheet.id && currentSheet?.platform === sheet.platform && musicIsBuffering(musicState)) ?
                                        <ActivityIndicator animating color={colors.text} size={iconSizeConst.tiny}/>
                                        :
                                        <Icon
                                            name={currentSheet?.id === sheet.id && currentSheet?.platform === sheet.platform && !musicIsPaused(musicState) ? "pause" : "play"}
                                            size={iconSizeConst.tiny}
                                            color={colors.text}
                                        />
                                    }
                                </View>
                            </ListItem.ListItemImage>
                            <ListItem.Content
                                title={sheet.title}
                                description={
                                    <ThemeText
                                        numberOfLines={1}
                                        fontSize="description"
                                        fontColor="textSecondary"
                                        style={[ListItem.styles.contentDesc]}>
                                        {!isLocalSheet && sheet?.platform && <Tag tagName={sheet?.platform}/>}
                                        {(sheet?.worksNum || sheet?.worksNum == 0) &&
                                        <Tag tagName={t("home.songCount", {count: sheet.worksNum})}/>}
                                    </ThemeText>
                                }
                            />
                            {pressingSheet === sheet ? (
                                <>
                                    {isLocalSheet &&
                                    <ListItem.ListItemIcon
                                        position="right"
                                        icon="pencil-outline"
                                        onPress={() => {
                                            navigate(ROUTE_PATH.EDIT_MUSIC_SHEET_INFO, {
                                                musicSheet: sheet,
                                            });
                                        }}
                                    />
                                    }
                                    {sheet.id !== MusicSheet.defaultSheet.id &&
                                    <ListItem.ListItemIcon
                                        position="right"
                                        icon="trash-outline"
                                        onPress={() => {
                                            showDialog("SimpleDialog", {
                                                title: t("dialog.deleteSheetTitle"),
                                                content: t("dialog.deleteSheetContent", {
                                                    name: sheet.title,
                                                }),
                                                onOk: async () => {
                                                    if (isLocalSheet) {
                                                        await MusicSheet.removeSheet(
                                                            sheet.id,
                                                        );
                                                        Toast.success(t("toast.deleteSuccess"));
                                                    } else {
                                                        await MusicSheet.unstarMusicSheet(
                                                            sheet,
                                                        );
                                                        Toast.success(t("toast.hasUnstarred"));
                                                    }
                                                },
                                            });
                                        }}
                                    />}
                                </>
                            ) : null}
                        </ListItem>
                    );
                }
                }
                nestedScrollEnabled
            />
        </>
    );
}

const styles = StyleSheet.create({
    subTitleContainer: {
        paddingHorizontal: rpx(24),
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: rpx(12),
    },
    subTitleLeft: {
        flexDirection: "row",
    },
    tabContainer: {
        flexDirection: "row",
        marginRight: rpx(32),
    },

    tabText: {
        lineHeight: rpx(60),
    },
    selectTabText: {
        borderBottomWidth: rpx(6),
        fontWeight: "bold",
    },
    more: {
        height: rpx(64),
        marginTop: rpx(3),
        flexGrow: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    newSheetButton: {
        marginRight: rpx(24),
    },
    maskIcon: {
        position: "absolute",
    },
    playSheet: {
        right: rpx(4),
        bottom: rpx(4),
        paddingHorizontal: rpx(8),
        paddingVertical: rpx(4),
        borderRadius: rpx(8),
    }
});
