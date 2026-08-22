import React, {memo, useEffect, useState} from "react";
import {ActivityIndicator, InteractionManager, Keyboard, StyleSheet, View} from "react-native";
import rpx from "@/utils/rpx";
import {CircularProgressBase} from "react-native-circular-progress-indicator";

import {useSafeAreaInsets} from "react-native-safe-area-context";
import useColors from "@/hooks/useColors";
import IconButton from "../base/iconButton";
import TrackPlayer, {useCurrentMusic, useMusicState, useProgress, useRepeatMode} from "@/core/trackPlayer";
import { musicIsBuffering, musicIsPaused } from "@/utils/trackUtils";
import MusicInfo from "./musicInfo";
import PlayListIcon from "./playListIcon";
import Icon from "@/components/base/icon";
import {showPanel} from "@/components/panels/usePanel";
import {MusicRepeatModeInfo} from "@/constants/trackPlayerConst";
import useOrientation from "@/hooks/useOrientation";
import delay from "@/utils/delay";

function CircularPlayBtn() {
    const progress = useProgress();
    const musicState = useMusicState();
    const colors = useColors();

    const isPaused = musicIsPaused(musicState);
    const isBuffering = musicIsBuffering(musicState);

    if (isBuffering) {
        return <View style={styles.bufferingContainer}>
            <ActivityIndicator size={rpx(52)} color={colors.musicBarText} />
        </View>;
    }

    return (
        <CircularProgressBase
            activeStrokeWidth={rpx(4)}
            inActiveStrokeWidth={rpx(2)}
            inActiveStrokeOpacity={0.2}
            value={
                progress?.duration
                    ? (100 * progress.position) / progress.duration
                    : 0
            }
            duration={100}
            radius={rpx(36)}
            activeStrokeColor={colors.musicBarText}
            inActiveStrokeColor={colors.textSecondary}>
            <IconButton
                accessibilityLabel={"播放或暂停歌曲"}
                name={isPaused ? "play" : "pause"}
                sizeType={"normal"}
                hitSlop={{
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 10,
                }}
                color={colors.musicBarText}
                onPress={async () => {
                    if (isPaused) {
                        await TrackPlayer.play();
                    } else {
                        await TrackPlayer.pause();
                    }
                }}
            />
        </CircularProgressBase>
    );
}
function MusicBar() {
    const musicItem = useCurrentMusic();

    const [showKeyboard, setKeyboardStatus] = useState(false);

    const colors = useColors();
    const safeAreaInsets = useSafeAreaInsets();
    const repeatMode = useRepeatMode();
    const orientation = useOrientation();

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardStatus(true);
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardStatus(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return (
        <>
            {musicItem && !showKeyboard && (
                <View
                    style={[
                        styles.wrapper,
                        {
                            backgroundColor: colors.musicBar,
                            paddingRight: safeAreaInsets.right + rpx(24),
                        },
                    ]}
                    accessible
                    accessibilityLabel={`歌曲: ${musicItem.title} 歌手: ${musicItem.artist}`}
                    // onPress={() => {
                    //     navigate(ROUTE_PATH.MUSIC_DETAIL);
                    // }}
                >
                    <MusicInfo musicItem={musicItem} />
                    <View style={styles.actionGroup}>
                        {orientation === 'horizontal' &&
                            <Icon
                                accessible
                                accessibilityLabel={MusicRepeatModeInfo[repeatMode].text}
                                name={MusicRepeatModeInfo[repeatMode].icon}
                                size={rpx(56)}
                                onPress={() => {
                                    TrackPlayer.toggleRepeatMode();
                                }}
                                color={colors.musicBarText}
                                style={{marginRight: rpx(48)}}
                            />
                        }
                        {orientation === 'horizontal' &&
                            <Icon
                                accessible
                                accessibilityLabel="上一首"
                                name="skip-left"
                                size={rpx(56)}
                                onPress={() => {
                                    TrackPlayer.skipToPrevious();
                                }}
                                color={colors.musicBarText}
                            />
                        }
                        <CircularPlayBtn />
                        {orientation === 'horizontal' &&
                            <Icon
                                accessible
                                accessibilityLabel="下一首"
                                name="skip-right"
                                size={rpx(56)}
                                onPress={() => {
                                    TrackPlayer.skipToNext();
                                }}
                                color={colors.musicBarText}
                                style={{marginRight: rpx(48)}}
                            />
                        }
                        <PlayListIcon color={colors.musicBarText}/>
                    </View>
                </View>
            )}
        </>
    );
}

export default memo(MusicBar, () => true);

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: rpx(132),
        flexDirection: "row",
        alignItems: "center",
        paddingRight: rpx(24),
    },
    bufferingContainer: {
        width: rpx(72),
        height: rpx(72),
        justifyContent: "center",
        alignItems: "center",
    },
    actionGroup: {
        justifyContent: "flex-end",
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(48),
        paddingLeft: '1%'
    },
});
