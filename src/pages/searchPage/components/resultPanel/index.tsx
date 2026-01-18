/**
 * 搜索结果面板 一级页
 */
import React, { memo, useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
import rpx, { vw } from "@/utils/rpx";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import ResultSubPanel from "./resultSubPanel";
import results from "./results";
import { fontWeightConst } from "@/constants/uiConst";
import useColors from "@/hooks/useColors";
import { useI18N } from "@/core/i18n";
import { useAtom } from "jotai";
import { typeAtom } from "@/pages/searchPage/store/atoms";

const routes = results;

const getRouterScene = (
    routes: Array<{ key: ICommon.SupportMediaType; title: string }>,
) => {
    const scene: Record<string, () => JSX.Element> = {};
    routes.forEach(r => {
        scene[r.key] = () => <ResultSubPanel tab={r.key} />;
    });
    return SceneMap(scene);
};

const renderScene = getRouterScene(routes);

function ResultPanel() {
    const [scene] = useAtom(typeAtom);
    // 1. 用 useMemo 缓存 scene 对应的索引（仅 scene/routes 变化时计算）
    const initIndex = useMemo(
        () => scene ? routes.findIndex(route => route.key === scene) : 0,
        [scene]
    );

    // 2. 初始化 index，并保留 setIndex 用于手动修改
    const [index, setIndex] = useState(initIndex);

    // 3. 极简写法：scene 变化时同步更新 index（仅一行核心逻辑）
    useEffect(() => setIndex(initIndex), [initIndex]);

    const colors = useColors();
    const { t } = useI18N();

    return (
        <TabView
            lazy
            navigationState={{
                index,
                routes,
            }}
            renderTabBar={props => (
                <TabBar
                    {...props}
                    scrollEnabled
                    style={{
                        backgroundColor: colors.tabBar,
                        shadowColor: "transparent",
                        borderColor: "transparent",
                    }}
                    inactiveColor={colors.text}
                    activeColor={colors.primary}
                    tabStyle={{
                        width: "auto",
                    }}
                    renderLabel={({ route, focused, color }) => (
                        <Text
                            numberOfLines={1}
                            style={{
                                width: rpx(160),
                                fontWeight: focused
                                    ? fontWeightConst.bolder
                                    : fontWeightConst.medium,
                                color,
                                textAlign: "center",
                            }}>
                            {route.i18nKey ? t(route.i18nKey as any) : route.title}
                        </Text>
                    )}
                    indicatorStyle={{
                        backgroundColor: colors.primary,
                        height: rpx(4),
                    }}
                />
            )}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: vw(100) }}
        />
    );
}

export default memo(ResultPanel);
