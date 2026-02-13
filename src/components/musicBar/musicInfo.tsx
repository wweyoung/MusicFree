import React, {memo, useLayoutEffect, useMemo} from "react";
import {StyleSheet, View} from "react-native";
import rpx from "@/utils/rpx";
import FastImage from "../base/fastImage";
import {ImgAsset} from "@/constants/assetsConst";
import Color from "color";
import ThemeText from "../base/themeText";
import useColors from "@/hooks/useColors";
import {ROUTE_PATH, useNavigate} from "@/core/router";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import TrackPlayer, {useMusicState, usePlayList} from "@/core/trackPlayer";
import Animated, {runOnJS, SharedValue, useAnimatedStyle, useSharedValue, withTiming,} from "react-native-reanimated";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {timingConfig} from "@/constants/commonConst";
import {useCurrentLyricItem} from "@/core/lyricManager";
import globalStyle from "@/constants/globalStyle";
import ScrollLineView from "@/components/base/scrollLineView";
import {musicIsPaused} from "@/utils/trackUtils";

interface IBarMusicItemProps {
    musicItem: IMusic.IMusicItem | null;
    activeIndex: number; // 当前展示的是0/1/2
    transformSharedValue: SharedValue<number>;
}

function _BarMusicItem(props: IBarMusicItemProps) {
    const {musicItem, activeIndex, transformSharedValue} = props;
    const colors = useColors();
    const safeAreaInsets = useSafeAreaInsets();
    const currentLyricItem = useCurrentLyricItem();
    const animatedStyles = useAnimatedStyle(() => {
        return {
            left: `${(transformSharedValue.value + activeIndex) * 100}%`,
        };
    }, [activeIndex]);
    const musicState = useMusicState();
    const isPaused = musicIsPaused(musicState);

    if (!musicItem) {
        return null;
    }

    // 用 useMemo 缓存 children，只有依赖数组中的变量变化时，才重新创建 children
    const titleMemo = useMemo(() => {
        return (<ScrollLineView scrollType={isPaused || activeIndex != 0 ? 'none' : 'continue'}>
            <ThemeText fontSize="content" fontColor="musicBarText">
                {musicItem?.title}
            </ThemeText>
            {musicItem?.artist && (
                <ThemeText
                    fontSize="subTitle"
                    color={Color(colors.musicBarText)
                        .alpha(0.6)
                        .toString()}>
                    {" "}
                    - {musicItem.artist}
                </ThemeText>
            )}
        </ScrollLineView>);
    }, [musicItem?.title, musicItem?.artist, isPaused, activeIndex]); // 空依赖数组 → 仅挂载时创建一次，引用永久稳定
    const duration = (currentLyricItem?.duration ?? 0) * 1000;
    // 用 useMemo 缓存 children，只有依赖数组中的变量变化时，才重新创建 children
    const lrcMemo = useMemo(() => {
        return (<ScrollLineView scrollType={isPaused ? 'none' : 'once'} duration={duration}
                                sleepTime={duration / 10}>
            {currentLyricItem && (
                <ThemeText fontSize="subTitle" fontColor="musicBarText" numberOfLines={1}>
                    {currentLyricItem?.lrc || ' '}
                </ThemeText>
            )}
        </ScrollLineView>);
    }, [currentLyricItem, currentLyricItem?.lrc, isPaused]); // 空依赖数组 → 仅挂载时创建一次，引用永久稳定


    return (
        <Animated.View
            style={[
                styles.container,
                {
                    paddingLeft: rpx(24) + safeAreaInsets.left,
                },
                animatedStyles,
            ]}>
            <FastImage
                style={styles.artworkImg}
                source={musicItem.artwork}
                placeholderSource={ImgAsset.albumDefault}
            />
            <View style={[globalStyle.fwflex1, {gap: rpx(12)}]}>
                {titleMemo}
                {activeIndex === 0 && (
                    lrcMemo
                )}
            </View>
        </Animated.View>
    );
}

const BarMusicItem = memo(
    _BarMusicItem,
    (prev, curr) =>
        prev.musicItem === curr.musicItem &&
        prev.activeIndex === curr.activeIndex,
);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        position: "absolute",
    },
    textWrapper: {
        // flexGrow: 1,
        // flexShrink: 1,
    },
    artworkImg: {
        width: rpx(96),
        height: rpx(96),
        borderRadius: rpx(48),
        marginRight: rpx(24),
    },
    lyric: {
        width: "100%"
    }
});

interface IMusicInfoProps {
    musicItem: IMusic.IMusicItem | null;
    paddingLeft?: number;
}

function skipMusicItem(direction: number) {
    if (direction === -1) {
        TrackPlayer.skipToNext();
    } else if (direction === 1) {
        TrackPlayer.skipToPrevious();
    }
}

export default function MusicInfo(props: IMusicInfoProps) {
    const {musicItem} = props;
    const navigate = useNavigate();
    const playLists = usePlayList();
    const siblingMusicItems = useMemo(() => {
        if (!musicItem) {
            return {
                prev: null,
                next: null,
            };
        }
        return {
            prev: TrackPlayer.previousMusic,
            next: TrackPlayer.nextMusic,
        };
    }, [musicItem, playLists]);

    // +- 1
    const transformSharedValue = useSharedValue(0);

    const musicItemWidthValue = useSharedValue(0);

    const tapGesture = Gesture.Tap()
        .onStart(() => {
            navigate(ROUTE_PATH.MUSIC_DETAIL);
        })
        .runOnJS(true);

    useLayoutEffect(() => {
        transformSharedValue.value = 0;
    }, [musicItem]);

    const panGesture = Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .onUpdate(e => {
            if (musicItemWidthValue.value) {
                transformSharedValue.value =
                    e.translationX / musicItemWidthValue.value;
            }
        })
        .onEnd((e, success) => {
            if (!success) {
                // 还原到原始位置
                transformSharedValue.value = withTiming(
                    0,
                    timingConfig.animationFast,
                );
            } else {
                // fling
                const deltaX = e.translationX;
                const vX = e.velocityX;

                let skip = 0;
                if (musicItemWidthValue.value) {
                    const rate = deltaX / musicItemWidthValue.value;

                    if (Math.abs(rate) > 0.3) {
                        // 先判断距离
                        skip = vX > 0 ? 1 : -1;
                        transformSharedValue.value = withTiming(
                            skip,
                            timingConfig.animationFast,
                            () => {
                                runOnJS(skipMusicItem)(skip);
                            },
                        );
                    } else if (Math.abs(vX) > 1500) {
                        // 再判断速度
                        skip = vX > 0 ? 1 : -1;
                        transformSharedValue.value = skip;
                        runOnJS(skipMusicItem)(skip);
                    } else {
                        transformSharedValue.value = withTiming(
                            0,
                            timingConfig.animationFast,
                        );
                    }
                } else {
                    transformSharedValue.value = 0;
                }
            }
        });

    const gesture = Gesture.Race(panGesture, tapGesture);

    return (
        <GestureDetector gesture={gesture}>
            <View
                style={musicInfoStyles.infoContainer}
                onLayout={e => {
                    musicItemWidthValue.value = e.nativeEvent.layout.width;
                }}>
                <BarMusicItem
                    transformSharedValue={transformSharedValue}
                    musicItem={siblingMusicItems.prev}
                    activeIndex={-1}
                />
                <BarMusicItem
                    transformSharedValue={transformSharedValue}
                    musicItem={musicItem}
                    activeIndex={0}
                />
                <BarMusicItem
                    transformSharedValue={transformSharedValue}
                    musicItem={siblingMusicItems.next}
                    activeIndex={1}
                />
            </View>
        </GestureDetector>
    );
}

const musicInfoStyles = StyleSheet.create({
    infoContainer: {
        flex: 1,
        height: "100%",
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden",
    },
});
