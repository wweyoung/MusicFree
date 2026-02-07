import {View} from "react-native";
import Icon from "@/components/base/icon";
import rpx from "@/utils/rpx";
import {showPanel} from "@/components/panels/usePanel";
import ThemeText from "@/components/base/themeText";
import React from "react";
import {usePlayList} from "@/core/trackPlayer";

function PlayListIcon(props) {
    const playList = usePlayList();

    return (
        <View style={{alignItems: 'center'}}>
            <Icon
                accessible
                accessibilityLabel="播放列表"
                name="playlist"
                size={rpx(56)}
                onPress={() => {
                    showPanel("PlayList");
                }}
                color={props.color}
            />
            <ThemeText fontSize="description" color={props.color}
            >
                {playList.length}
            </ThemeText>
        </View>
    )
}

export default PlayListIcon;
