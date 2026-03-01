import {Rect, Svg, SvgProps} from 'react-native-svg';
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import {useEffect} from 'react';
import {ColorValue} from 'react-native';

interface IProps extends SvgProps {
    color: ColorValue;
    size?: number;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function WaveLoader(props: IProps) {
    const scales = [
        useSharedValue(0.4),
        useSharedValue(0.4),
        useSharedValue(0.4),
        useSharedValue(0.4),
        useSharedValue(0.4),
    ];

    // 原始最大高度（用于 scale 基准）
    const maxHeights = [300, 450, 600, 450, 300];

    // 垂直居中基准线
    const centerY = 1024 / 2; // 512

    // ----------------- 自动均匀分布 x 位置 -----------------
    const barWidth = 60;                    // 柱子宽度（可调）
    const viewBoxWidth = 1024;
    const segment = viewBoxWidth / 6;       // 分成 6 份（5 柱 + 5 间隙）
    const xPositions = Array.from({ length: 5 }, (_, index) => {
        // 每个柱子中心在第 (index+1) 个段的中间
        const centerOfSegment = segment * (index + 1);
        return centerOfSegment - barWidth / 2; // 向左偏移一半宽度 → 柱子居中
    });

    const animatedPropsList = scales.map((scale, index) => {
        return useAnimatedProps(() => {
            const scaleValue = scale.value;
            const currentHeight = maxHeights[index] * scaleValue;
            const y = centerY - currentHeight / 2;

            return {
                height: currentHeight,
                y: y,
            };
        });
    });

    useEffect(() => {
        scales.forEach((scale, i) => {
            // 从中间向两边传播（中间先动）
            const delay = Math.abs(i - 2) * 200;

            scale.value = withDelay(
                delay,
                withRepeat(
                    withTiming(1.0, {
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    -1,
                    true
                )
            );
        });
    }, []);

    return (
        <Svg width={props.size} height={props.size} viewBox="0 0 1024 1024" {...props}>
            {scales.map((_, index) => (
                <AnimatedRect
                    key={index}
                    x={xPositions[index]}
                    width={barWidth}
                    rx={15}
                    fill={props.color}
                    animatedProps={animatedPropsList[index]}
                />
            ))}
        </Svg>
    );
}
