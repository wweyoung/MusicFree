import React, {useMemo} from "react";
import rpx from "@/utils/rpx";
import {ImgAsset} from "@/constants/assetsConst";
import FastImage from "@/components/base/fastImage";
import useOrientation from "@/hooks/useOrientation";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {useCurrentMusic} from "@/core/trackPlayer";
import globalStyle from "@/constants/globalStyle";
import {View} from "react-native";
import Operations from "./operations";
import {showPanel} from "@/components/panels/usePanel.ts";
import ThemeText from "@/components/base/themeText";
import {useCurrentLyricItem, useLyricState} from "@/core/lyricManager";
import PersistStatus from "@/utils/persistStatus";

interface IProps {
    onTurnPageClick?: () => void;
}

export default function AlbumCover(props: IProps) {
    const { onTurnPageClick } = props;

    const musicItem = useCurrentMusic();
    const orientation = useOrientation();
    const { hasTranslation } = useLyricState();
    const currentLrcItem = useCurrentLyricItem();
    const showTranslation = PersistStatus.useValue(
        "lyric.showTranslation",
        false,
    );
    const detailFontSize = PersistStatus.useValue("lyric.detailFontSize");

    const artworkStyle = useMemo(() => {
        if (orientation === "vertical") {
            return {
                width: rpx(500),
                height: rpx(500),
            };
        } else {
            return {
                width: rpx(260),
                height: rpx(260),
            };
        }
    }, [orientation]);

    const longPress = Gesture.LongPress()
        .onStart(() => {
            if (musicItem?.artwork) {
                showPanel("ImageViewer", {
                    url: musicItem.artwork,
                });
            }
        })
        .runOnJS(true);

    const tap = Gesture.Tap()
        .onStart(() => {
            onTurnPageClick?.();
        })
        .runOnJS(true);

    const combineGesture = Gesture.Race(tap, longPress);

    return (
        <>
            <GestureDetector gesture={combineGesture}>
                <View style={[globalStyle.fullCenter, {gap: rpx(70)}]}>
                    <FastImage
                        style={artworkStyle}
                        source={musicItem?.artwork}
                        placeholderSource={ImgAsset.albumDefault}
                    />

                    {orientation === 'vertical' && (
                        <View style={{height: rpx(80), gap: rpx(10)}}>
                            <ThemeText fontColor="primary" style={{textAlign: "center"}}>
                                {currentLrcItem?.lrc}
                            </ThemeText>
                            {showTranslation && hasTranslation && (
                                <ThemeText fontColor="primary" style={{textAlign: "center"}}>
                                    {currentLrcItem?.translation}
                                </ThemeText>
                            )}
                        </View>

                    )}
                </View>
            </GestureDetector>
            <Operations />
        </>
    );
}
