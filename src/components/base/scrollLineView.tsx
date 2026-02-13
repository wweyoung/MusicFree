import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, LayoutChangeEvent, ScrollView, StyleSheet, Text, View,} from 'react-native';
import delay from '@/utils/delay';
import globalStyle from '@/constants/globalStyle';

interface ScrollLineViewProps {
    children: React.ReactNode;
    duration?: number;
    speed?: number;
    pauseOnTouch?: boolean;
    containerStyle?: any;
    sleepTime?: number;
    scrollType?: 'continue' | 'once' | 'sway' | 'none';
    watch?: any[]
}

const ScrollLineView = (props: ScrollLineViewProps) => {
    let {
        children,
        speed,
        duration,
        containerStyle,
        sleepTime = 2000,
        scrollType = 'continue',
        watch
    } = props;
    if (!speed && !duration) {
        speed = 1;
    }
    if (sleepTime < 100) {
        sleepTime = 100;
    }

    const scrollAnim = useRef(new Animated.Value(0)).current; // 新增：Animated 值

    const containerWidthRef = useRef(0);
    const childrenWidthRef = useRef(0);
    const textWidthRef = useRef(0);
    const isMountedRef = useRef(false);

    const [isPaused, setIsPaused] = useState(false);
    const [isOverflow, setIsOverflow] = useState(false);

    const isScrollingRight = useRef(true);
    const lastSleepTime = useRef(0);

    const gap = 60;

    // 尺寸相關函數完全不變
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
        let isOverflow = textWidthRef.current > containerWidthRef.current;
        setIsOverflow(isOverflow);
        return isOverflow
    };

    const clearScroll = () => {
        scrollAnim.stopAnimation();
        scrollAnim.setValue(0);
        lastSleepTime.current = 0;
    };

    // 改造重點：用 Animated 替換 setInterval
    const startBackAndForthScroll = () => {
        if (
            !isMountedRef.current ||
            containerWidthRef.current <= 0 ||
            childrenWidthRef.current <= 0 ||
            isPaused
        ) {
            return;
        }

        // 先停止舊動畫
        clearScroll();

        if (!refreshIsOverflow()) {
            return;
        }

        const maxScrollX = childrenWidthRef.current - containerWidthRef.current;

        // 計算滾動時長（ms）
        let animDuration: number;
        if (duration && duration > 0) {
            animDuration = Math.max(duration - sleepTime * 2, 500);
        } else if (speed && speed > 0 && textWidthRef.current > 0) {
            animDuration = (textWidthRef.current / speed) * 50;
        } else {
            animDuration = 10000; // 兜底
        }

        // 根據 scrollType 執行
        if (scrollType === 'continue') {
            // 單次去程動畫
            const goAnim = Animated.timing(scrollAnim, {
                toValue: -(textWidthRef.current + gap),
                duration: animDuration,
                easing: Easing.linear,
                useNativeDriver: true, // scrollTo 不支援 native driver
            });
            // 循環：去 → 停留 → 重置 → 去...
            Animated.loop(
                Animated.sequence([
                    goAnim,
                    Animated.delay(sleepTime), // 到頭停留
                    Animated.timing(scrollAnim, {
                        toValue: 0,
                        duration: 0, // 瞬間重置（或設小值）
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else if (scrollType === 'once') {
            // 單次去程動畫
            const goAnim = Animated.timing(scrollAnim, {
                toValue: -maxScrollX,
                duration: animDuration,
                easing: Easing.linear,
                useNativeDriver: true, // scrollTo 不支援 native driver
            });
            goAnim.start();
        } else if (scrollType === 'sway') {
            // 單次去程動畫
            const goAnim = Animated.timing(scrollAnim, {
                toValue: -maxScrollX,
                duration: animDuration,
                easing: Easing.linear,
                useNativeDriver: true, // scrollTo 不支援 native driver
            });

            // 簡化來回一次，可擴展
            Animated.sequence([
                goAnim,
                Animated.delay(sleepTime),
                Animated.timing(scrollAnim, {
                    toValue: 0,
                    duration: animDuration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        // 記得在組件卸載時移除 listener
        return () => {
        };
    };

    useEffect(() => {
        isMountedRef.current = true;
        setIsOverflow(false);

        delay(sleepTime).then(() => {
            startBackAndForthScroll();
        });

        return () => {
            isMountedRef.current = false;
            clearScroll();
        };
    }, [isPaused, scrollType, duration, speed, children]);

    return (
        <View style={[styles.container, containerStyle]} onLayout={onContainerLayout}>
            <ScrollView
                style={[styles.scrollView, globalStyle.notShrink]}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}           // ← 关键：禁止手动滚动，让 Animated 控制
                bounces={false}
            >
                <Animated.View
                    style={[styles.animatedView, {
                        transform: [{ translateX: scrollAnim }] // ← 用 transform 实现滚动
                    }]}
                    onLayout={onChildrenLayout}
                >
                    <Text numberOfLines={1} onLayout={onTextLayout}>
                        {children}
                    </Text>
                    {isOverflow && scrollType === 'continue' && (
                        <Text numberOfLines={1} style={{ marginLeft: gap }}>
                            {children}
                        </Text>
                    )}
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    scrollView: {},
    animatedView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    childrenWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default ScrollLineView;
