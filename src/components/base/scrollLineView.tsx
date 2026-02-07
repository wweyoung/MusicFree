import React, {useEffect, useRef, useState} from 'react';
import {LayoutChangeEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeScrollEvent} from "react-native/Libraries/Components/ScrollView/ScrollView";
import delay from "@/utils/delay";
import globalStyle from "@/constants/globalStyle";

interface ScrollLineViewProps {
    children,
    duration?: number,
    speed?: number,
    pauseOnTouch?: boolean,
    containerStyle?,
    contentStyle?,
    sleepTime?: number
    scrollType?: 'continue' | 'once' | 'sway' | 'none'
}

const ScrollLineView = (
    {
        children,
        speed, // 兜底默认值，避免 undefined
        duration,
        pauseOnTouch = false,
        containerStyle,
        contentStyle,
        scrollType = 'continue',
        sleepTime = 0
    }: ScrollLineViewProps) => {
    if (!speed && !duration) {
        speed = 1;
    }
// 核心引用：添加组件挂载状态，防止卸载后调用 Native 方法
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const containerWidthRef = useRef(0);
    const childrenWidthRef = useRef(0);
    const textWidthRef = useRef(0);
    const isMountedRef = useRef(false); // 标记组件是否已挂载
    // 🔥 核心：存储当前滚动 x 位置（useRef 高效存储，无重渲染）
    const currentScrollXRef = useRef(0);

    // 核心状态：兜底初始值，避免类型异常
    const [isPaused, setIsPaused] = useState(false);
    const [isOverflow, setIsOverflow] = useState(false);
    const isScrollingRight = useRef(true);
    const lastSleepTime = useRef(0);


    const gap = 60;
    const rate = 20;
    const delayTime = 500;

    // 2. 获取容器/子组件宽度：兜底数值，避免非数字
    const onContainerLayout = (e: LayoutChangeEvent) => {
        const width = e.nativeEvent.layout.width;
        containerWidthRef.current = width > 0 ? width : 0;
        refreshIsOverflow();
    };

    const onChildrenLayout = (e: LayoutChangeEvent) => {
        const width = e.nativeEvent.layout.width;
        childrenWidthRef.current = width > 0 ? width : 0;
    };

    const onTextLayout = (e: LayoutChangeEvent) => {
        const width = e.nativeEvent.layout.width;
        textWidthRef.current = width > 0 ? width : 0;
        refreshIsOverflow();
    };

    const refreshIsOverflow = () => {
        setIsOverflow(textWidthRef.current > containerWidthRef.current);
    }

    // 🔥 核心：监听 scroll 事件，获取当前 x 位置
    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // currentScrollXRef.current = e.nativeEvent.contentOffset.x;
    };

    const clearScroll = () => {
        // console.log("clearScroll")
        clearInterval(scrollTimerRef.current);
        scrollTimerRef.current = null;
        scrollViewRef.current?.scrollTo({x: 0, animated: false});
        currentScrollXRef.current = 0;
        lastSleepTime.current = 0;
    }

    // 3. 启动/重启来回滚动：安全调用 + 参数兜底（核心修复）
    const startBackAndForthScroll = () => {
        // 前置判断：组件未挂载/已暂停/无有效尺寸，直接返回
        if (!isMountedRef.current || containerWidthRef.current <= 0 || childrenWidthRef.current <= 0) {
            return;
        }
        refreshIsOverflow();
        // 滚动速度兜底：确保是正数字，避免非法速度
        const safeSpeed = speed > 0 ? speed : (textWidthRef.current - containerWidthRef.current) / Math.max(1, duration - delayTime / 1000) / rate;
        // console.log(safeSpeed, textWidthRef.current, duration)
        // 清除已有定时器，避免重复调用
        clearScroll();
        // // 定时滚动：安全调用 + x 坐标兜底
        scrollTimerRef.current = setInterval(() => {
            if (lastSleepTime.current + sleepTime > Date.now()) {
                return;
            }

            // 计算最大滚动距离：兜底非负数值，避免 NaN
            const maxScrollX = childrenWidthRef.current - containerWidthRef.current;

            // if (maxScrollX <= 0 || !isOverflow) {
            //     return;
            // }
            //
            // // 双重安全校验：组件已卸载/ScrollView 实例不存在，直接清除定时器
            // if (!isMountedRef.current || !scrollViewRef.current) {
            //     clearScroll();
            //     return;
            // }
            let newX = currentScrollXRef.current;
            if (scrollType === 'continue' || scrollType === 'once') {
                if (textWidthRef.current + gap - currentScrollXRef.current <= 1) {
                    newX = 0;
                    lastSleepTime.current = Date.now();
                } else {
                    newX += safeSpeed;
                }
                // console.log(maxScrollX, newX);
            } else if (scrollType === 'sway') {
                if (maxScrollX - currentScrollXRef.current <= 1) {
                    isScrollingRight.current = false;
                } else if (currentScrollXRef.current <= 1) {
                    isScrollingRight.current = true;
                    lastSleepTime.current = Date.now();
                }

                if (isScrollingRight.current) {
                    newX += safeSpeed;
                } else {
                    newX -= safeSpeed;
                }
            }
            newX = Math.max(0, Math.min(newX, maxScrollX));
            // console.log(newX, currentScrollXRef.current, maxScrollX)
            if (newX !== currentScrollXRef.current) {
                currentScrollXRef.current = newX;
                scrollViewRef.current?.scrollTo({
                    x: newX,
                    animated: false, // 关闭内置动画，避免桥接冲突
                });
            }
        }, rate);
    };

    // 4. 监听依赖变化：安全启动滚动，添加挂载状态监听
    useEffect(() => {
        isMountedRef.current = true; // 组件挂载时标记
        setIsOverflow(false);
        delay(delayTime + sleepTime).then(()=>{
            startBackAndForthScroll();
        })
        // 组件卸载：彻底清除所有定时器 + 标记未挂载（核心：防止卸载后调用 Native 方法）
        return () => {
            isMountedRef.current = false;
            clearScroll();
        };
    }, [isPaused, scrollType, duration, speed, children]);

    return (
        <View
            style={[styles.container, containerStyle]}
            onLayout={onContainerLayout}
        >
            <ScrollView
                ref={scrollViewRef}
                style={[styles.scrollView, globalStyle.notShrink]}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                bounces={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View style={[styles.childrenWrapper, contentStyle]} onLayout={onChildrenLayout}>
                    <Text numberOfLines={1} onLayout={onTextLayout}>
                        {children}
                    </Text>
                    {isOverflow && scrollType === 'continue' && (
                        <Text numberOfLines={1} style={{marginLeft: gap}}>
                            {children}
                        </Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

// 样式表：兜底合法样式，避免非法值导致 Native 解析错误
const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    scrollView: {
    },
    childrenWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default ScrollLineView;
