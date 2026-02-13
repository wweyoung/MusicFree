import {vmax} from "@/utils/rpx";
import React from "react";
import {View} from "react-native";
import globalStyle from "@/constants/globalStyle";
import PanelBase from "../base/panelBase";
import PanelHeader from "../base/panelHeader";
import {useI18N} from "@/core/i18n";
import {LyricSetting} from "@/pages/setting/settingTypes/lyricSetting";


export default function LyricSettingPanel() {
    const { t } = useI18N();

    return (
        <PanelBase
            height={vmax(60)}
            keyboardAvoidBehavior={"none"}
            renderBody={() => (
                <>
                    <PanelHeader hideButtons title={t("basicSettings.lyric")}/>
                    <View style={globalStyle.fwflex1}>
                        <LyricSetting/>
                    </View>
                </>
            )}
        />
    );
}
