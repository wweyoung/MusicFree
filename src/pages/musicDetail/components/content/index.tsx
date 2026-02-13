import React, {useState} from "react";
import {StyleSheet, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {NavigationState, SceneMap, SceneRendererProps, TabView,} from "react-native-tab-view";
import AlbumCover from "./albumCover";
import Lyric from "./lyric";
import useOrientation from "@/hooks/useOrientation";
import Config from "@/core/appConfig";
import globalStyle from "@/constants/globalStyle";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";

const initialTab = Config.getConfig("basic.musicDetailDefault") || "album";

const renderScene = SceneMap({
    album: AlbumCover,
    lyric: Lyric,
});

export default function Content() {
    const layout = useWindowDimensions();
    const orientation = useOrientation();

    const [index, setIndex] = useState(initialTab === "lyric" ? 1 : 0);

    const [routes] = useState([
        { key: "album" },
        { key: "lyric" },
    ]);
    const colors = useColors();

    // 橫屏時強制固定在專輯封面（index = 0）
    React.useEffect(() => {
        if (orientation === "horizontal") {
            setIndex(0);
        }
    }, [orientation]);

    // 是否允許滑動切換
    const canSwipe = orientation === "vertical"; // 橫屏不讓滑動

    // 核心改造：自定义圆点式 TabBar
    const renderDotTabBar = (
        props: SceneRendererProps & {
            navigationState: NavigationState<{ key: string; title: string }>;
        },
    ) => {
        // 橫屏隱藏 tab bar
        if (orientation === "horizontal") return null;

        const { navigationState, jumpTo } = props;
        const { index: activeIndex } = navigationState;

        return (
            <View style={styles.dotTabBarContainer}>
                {routes.map((route, index)=>(
                    <TouchableOpacity
                        key={route.key}
                        style={[styles.dotItem, {backgroundColor: colors.background},
                            activeIndex === index && [styles.activeDot, {backgroundColor: colors.primary}]]}
                        onPress={() => jumpTo(route.key)} // 复用 TabView 的跳转方法
                        activeOpacity={0.7} // 点击反馈
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={globalStyle.fwflex1}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderDotTabBar} // 替换为自定义圆点 TabBar
                swipeEnabled={canSwipe}
                lazy={true}
                sceneContainerStyle={{ flex: 1 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // 圆点 TabBar 容器：水平居中、半透明背景
    dotTabBarContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    // 基础圆点样式
    dotItem: {
        width: rpx(10),
        height: rpx(10),
        borderRadius: rpx(10), // 圆形
        marginHorizontal: rpx(10), // 两个圆点间距20px
    },
    // 选中圆点样式
    activeDot: {
    },
});
