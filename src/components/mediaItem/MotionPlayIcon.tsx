import ListItem from "@/components/base/listItem";
import rpx from "@/utils/rpx";
import TrackPlayer from "@/core/trackPlayer";
import React from "react";

export function MotionPlayIcon(musicItem) {


    return (
        <>
            <ListItem.ListItemIcon
                fixedWidth={true}
                width={rpx(42)}
                position="right"
                icon="motion-play"
                onPress={() => {
                    TrackPlayer.addNext(musicItem);
                }}
            />
            <ListItem.ListItemIcon
                containerStyle={{
                    display: 'none',
                    position: 'absolute',
                    top:0,
                    left:0
                }}
                fixedWidth={true}
                width={rpx(42)}
                icon="motion-play"
            />
        </>
    )
}
