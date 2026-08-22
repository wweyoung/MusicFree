import React from "react";
import MusicList from "@/components/musicList";
import LocalMusicSheet from "@/core/localMusicSheet";
import { localMusicSheetId, localPluginPlatform, RequestStateCode } from "@/constants/commonConst";
import HorizontalSafeAreaView from "@/components/base/horizontalSafeAreaView.tsx";
import globalStyle from "@/constants/globalStyle";
import { useI18N } from "@/core/i18n";
import PlayAllBar from "@/components/base/playAllBar";

export default function LocalMusicList() {
    const musicList = LocalMusicSheet.useMusicList();
    const { t } = useI18N();

    const musicSheet = {
        id: localMusicSheetId,
        title: t("common.local"),
        platform: localPluginPlatform,
        musicList: musicList,
    }

    return (
        <HorizontalSafeAreaView style={globalStyle.flex1}>
            <MusicList
                musicList={musicList}
                showIndex
                state={RequestStateCode.IDLE}
                musicSheet={musicSheet}
                Header={
                    <PlayAllBar musicList={musicList} musicSheet={musicSheet} />
                }
            />
        </HorizontalSafeAreaView>
    );
}
