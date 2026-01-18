import ListItem from "@/components/base/listItem";
import { vmax } from "@/utils/rpx";
import Toast from "@/utils/toast";
import React from "react";
import { View } from "react-native";

import NoPlugin from "@/components/base/noPlugin";
import globalStyle from "@/constants/globalStyle";
import PluginManager from "@/core/pluginManager";
import pluginManager from "@/core/pluginManager";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PanelBase from "../base/panelBase";
import PanelHeader from "../base/panelHeader";
import { hidePanel } from "../usePanel";
import { useI18N } from "@/core/i18n";
import { getQualityOrder } from "@/utils/qualities";
import { useAppConfig } from "@/core/appConfig";
import { errorLog, trace } from "@/utils/log";
import deepMerge from "@/utils/deepMerge";


export default function UploadMusicItem(payload) {
    let musicItem: IMusic.IMusicItem = {
        ...payload.musicItem,
    };
    const validPlugins = PluginManager.getSortedPluginsWithAbility("uploadMusicItem");
    const { t } = useI18N();

    const safeAreaInsets = useSafeAreaInsets();
    const defaultDownloadQuality = useAppConfig("basic.defaultDownloadQuality");
    let quality = payload.quality ?? defaultDownloadQuality;
    const qualityOrder = useAppConfig("basic.downloadQualityOrder");
    return (
        <PanelBase
            height={vmax(60)}
            renderBody={() => (
                <>
                    <PanelHeader hideButtons title={t("common.upload")}/>
                    {validPlugins.length ? (
                        <View style={globalStyle.fwflex1}>
                            <FlatList
                                data={validPlugins}
                                keyExtractor={plugin => plugin.hash}
                                style={{
                                    marginBottom: safeAreaInsets.bottom,
                                }}
                                renderItem={({ item: plugin }) => (
                                    <ListItem
                                        withHorizontalPadding
                                        key={`${plugin.hash}`}
                                        onPress={async () => {
                                            Toast.warn(
                                                t("common.uploading"),
                                            );
                                            let sourcePlugin = pluginManager.getByMedia(musicItem);
                                            try {
                                                let musicInfo = (await sourcePlugin?.instance.getMusicInfo?.(musicItem) || musicItem) as IMusic.IMusicItem;
                                                deepMerge(musicItem, musicInfo, {
                                                    source: {},
                                                });
                                                if (sourcePlugin?.supportedMethods.has("getMediaSource")) {
                                                    const qualities = getQualityOrder(
                                                        quality ??
                                                        "standard",
                                                        qualityOrder ?? "asc",
                                                    );
                                                    let data: IMusic.IMediaSource | null | undefined = null;
                                                    for (let oneQuality of qualities) {
                                                        quality = oneQuality;
                                                        if (musicItem.source[oneQuality]?.url) {
                                                            break;
                                                        }
                                                        if (musicItem.qualities?.[oneQuality]?.url) {
                                                            data = musicItem.qualities[oneQuality] as IMusic.IMediaSource;
                                                        } else {
                                                            data = await sourcePlugin?.instance.getMediaSource?.(
                                                                musicItem,
                                                                oneQuality
                                                            )?.catch(e => {
                                                                errorLog("获取音源失败", e);
                                                                return;
                                                            });
                                                        }
                                                        if (data?.url) {
                                                            musicItem.source[oneQuality] = data;
                                                            break;
                                                        }
                                                    }
                                                }

                                                if (!musicItem.lrc && !musicItem.lyric && sourcePlugin?.supportedMethods.has("getLyric")) {
                                                    let lyric = await sourcePlugin?.instance.getLyric?.(musicItem);
                                                    if (lyric) {
                                                        musicItem.lyric = lyric;
                                                    }
                                                }

                                                trace("待上传音乐信息: ", musicItem);
                                            } catch (e) {
                                                errorLog("获取音源失败", e);
                                                Toast.warn(t("downloading.downloadFailReason.failToFetchSource"));
                                                return;
                                            }
                                            const result =
                                                await plugin.instance.uploadMusicItem(
                                                    musicItem, quality
                                                )?.catch(e => {
                                                    errorLog("上传失败", e);
                                                    Toast.warn(t("common.uploadError"));
                                                    return;
                                                });
                                            trace("触发上传成功", result);
                                            Toast.success(t("common.uploaded"));
                                            hidePanel();
                                        }}>
                                        <ListItem.Content title={plugin.name}/>
                                    </ListItem>
                                )}
                            />
                        </View>) : (
                        <NoPlugin notSupportType={t("common.upload")}/>
                    )}
                </>
            )}
        />
    );
}
