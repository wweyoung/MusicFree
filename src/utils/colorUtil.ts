import Color from "color";

export function grayRate(color: string | Color) {
    let _color = typeof color === "string" ? Color(color) : color;

    return (
        ((0.299 * _color.red() +
            0.587 * _color.green() +
            0.114 * _color.blue()) *
            2 -
            255) /
        255
    );
}

export function grayLevelCode(color: string | Color) {
    const gray = grayRate(color);
    console.log(gray);
    if (gray < 96) {
        return "dark";
    } else if (gray > 160) {
        return "light";
    } else {
        return "mid";
    }
}

export function getBackgroundColor(color: Color | string): Color {
    let _color: Color = typeof color === "string" ? Color(color) : color;
    return _color.mix(Color('white'), 0.75);

    if (_color.isDark()) {
        // 转浅背景色
        return _color
            .lighten(1)          // 提亮 70%
            .desaturate(0.6);       // 降饱和 30%
    } else {
        return _color
            .lighten(0.4)          // 提亮 70%
            .desaturate(0.1);       // 降饱和 30%
    }
    return _color;
}
