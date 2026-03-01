import rpx from "@/utils/rpx";
import React from "react";
import {InteractionManager, Pressable, StyleSheet, View} from "react-native";

import Icon from "@/components/base/icon.tsx";
import TrackPlayer, {useMusicState, useRepeatMode} from "@/core/trackPlayer";
import useOrientation from "@/hooks/useOrientation";
import delay from "@/utils/delay";
import { musicIsBuffering, musicIsPaused } from "@/utils/trackUtils";
import { MusicRepeatModeInfo } from "@/constants/trackPlayerConst";
import PlayListIcon from "@/components/musicBar/playListIcon";
import {WaveLoader} from "@/pages/musicDetail/components/bottom/waveLoading";
import {CircularProgressBase} from "react-native-circular-progress-indicator";

export default function () {
    const repeatMode = useRepeatMode();
    const musicState = useMusicState();

    const orientation = useOrientation();

    return (
        <>
            <View
                style={[
                    styles.wrapper,
                    orientation === "horizontal"
                        ? styles.marginTop0
                        : null,
                ]}>
                <Icon
                    color={"white"}
                    name={MusicRepeatModeInfo[repeatMode].icon}
                    size={rpx(56)}
                    onPress={async () => {
                        InteractionManager.runAfterInteractions(async () => {
                            await delay(20, false);
                            TrackPlayer.toggleRepeatMode();
                        });
                    }}
                />
                <Icon
                    color={"white"}
                    name={"skip-left"}
                    size={rpx(56)}
                    onPress={() => {
                        TrackPlayer.skipToPrevious();
                    }}
                />
                <Pressable onPress={() => {
                    if (musicIsBuffering(musicState)) {
                        return;
                    }
                    if (musicIsPaused(musicState)) {
                        TrackPlayer.play();
                    } else {
                        TrackPlayer.pause();
                    }
                }}>
                    <CircularProgressBase
                        activeStrokeWidth={rpx(2)}
                        inActiveStrokeWidth={rpx(2)}
                        radius={rpx(60)}
                        activeStrokeColor="white"
                        inActiveStrokeColor="white">
                        {musicIsBuffering(musicState) ? (
                            <WaveLoader color={"white"} size={rpx(96)} style={styles.playButton}/>
                        ) : (
                            <Icon
                                color={"white"}
                                name={musicIsPaused(musicState) ? "play" : "pause"}
                                size={rpx(72)}
                                style={styles.playButton}
                            />
                        )}
                    </CircularProgressBase>
                </Pressable>
                <Icon
                    color={"white"}
                    name={"skip-right"}
                    size={rpx(56)}
                    onPress={() => {
                        TrackPlayer.skipToNext();
                    }}
                />
                <PlayListIcon color={"white"}/>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        marginTop: rpx(36),
        height: rpx(140),
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    playButton: {
        margin: rpx(100)
    },
    marginTop0: {
        marginTop: 0,
    },
});
