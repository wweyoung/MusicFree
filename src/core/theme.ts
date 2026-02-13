import Config from "@/core/appConfig";

import {DarkTheme as _DarkTheme, DefaultTheme as _DefaultTheme} from "@react-navigation/native";
import {GlobalState} from "@/utils/stateMapper";
import {CustomizedColors} from "@/hooks/useColors";
import Color from "color";

export const basicColors = {
    rgb333: "#333333",
    orange: "#f17d34",
    blue: "#0A95C8",
    green: "#08A34C",
    pink: "#FC5F5F",
    purple: "#722ED1",
    rgbeee: "#eeeeee",
    white: "#fefefe"
}

export const basicColorValues = Object.values(basicColors)

const basicTheme = {
    success: basicColors.green,
    danger: basicColors.pink,
    info: basicColors.blue,
}

export const lightTheme = {
    id: "p-light",
    ..._DefaultTheme,
    ...basicTheme,
    colors: {
        ..._DefaultTheme.colors,
        background: "transparent",
        text: basicColors.rgb333,
        textSecondary: Color("rgba(51,51,51,0.7)").alpha(0.7).toString(),
        primary: basicColors.orange,
        pageBackground: basicColors.white,
        shadow: "#000",
        appBar: basicColors.orange,
        appBarText: basicColors.white,
        musicBar: basicColors.rgbeee,
        musicBarText: basicColors.rgb333,
        divider: basicColors.rgbeee,
        listActive: basicColors.rgbeee, // 在手机上表现是ripple
        mask: "rgba(51,51,51,0.2)",
        backdrop: basicColors.rgbeee,
        tabBar: basicColors.rgbeee,
        placeholder: basicColors.rgbeee,
        card: basicColors.rgbeee,
        notification: basicColors.rgbeee,
    },
};

export const darkTheme = {
    id: "p-dark",
    ..._DarkTheme,
    ...basicTheme,
    colors: {
        ..._DarkTheme.colors,
        background: "transparent",
        text: basicColors.white,
        textSecondary: Color("#fcfcfc").alpha(0.7).toString(),
        primary: basicColors.blue,
        pageBackground: "#202020",
        shadow: "#999",
        appBar: basicColors.rgb333,
        appBarText: basicColors.white,
        musicBar: basicColors.rgb333,
        musicBarText: basicColors.white,
        divider: "rgba(255,255,255,0.1)",
        listActive: "rgba(255,255,255,0.1)", // 在手机上表现是ripple
        mask: "rgba(33,33,33,0.8)",
        backdrop: basicColors.rgb333,
        tabBar: basicColors.rgb333,
        placeholder: "#424242",
        card: basicColors.rgb333,
        notification: basicColors.rgb333,
    },
};

interface IBackgroundInfo {
    url?: string;
    blur?: number;
    opacity?: number;
}

const themeStore = new GlobalState(darkTheme);
const backgroundStore = new GlobalState<IBackgroundInfo | null>(null);

export function getCurrentThemeDefault() {
    const currentTheme = Config.getConfig("theme.selectedTheme") ?? "p-light";

    if (currentTheme === "p-dark") {
        return darkTheme;
    } else if (currentTheme === "p-light") {
        return lightTheme;
    } else {
        return {
            id: currentTheme,
            dark: true,
            // @ts-ignore
            colors:
                (Config.getConfig("theme.defaultColors") as CustomizedColors) ??
                darkTheme.colors,
        };
    }
}


function setup() {
    const currentTheme = Config.getConfig("theme.selectedTheme") ?? "p-light";
    themeStore.setValue(getCurrentThemeDefault());

    const bgUrl = Config.getConfig("theme.background");
    const bgBlur = Config.getConfig("theme.backgroundBlur");
    const bgOpacity = Config.getConfig("theme.backgroundOpacity");

    backgroundStore.setValue({
        url: bgUrl,
        blur: bgBlur ?? 20,
        opacity: bgOpacity ?? 0.6,
    });
}

function setTheme(
    themeName: string,
    extra?: {
        colors?: Partial<CustomizedColors>;
        background?: IBackgroundInfo;
    },
) {
    if (themeName === "p-light") {
        themeStore.setValue(lightTheme);
    } else if (themeName === "p-dark") {
        themeStore.setValue(darkTheme);
    } else {
        themeStore.setValue({
            id: themeName,
            dark: true,
            colors: {
                ...darkTheme.colors,
                ...(extra?.colors ?? {}),
            },
        });
        Config.setConfig("theme.defaultColors", themeStore.getValue().colors);
    }

    Config.setConfig("theme.selectedTheme", themeName);
    Config.setConfig("theme.colors", themeStore.getValue().colors);

    if (extra?.background) {
        const currentBg = backgroundStore.getValue();
        let newBg: IBackgroundInfo = {
            blur: 20,
            opacity: 0.6,
            ...(currentBg ?? {}),
            url: undefined,
        };
        if (typeof extra.background.blur === "number") {
            newBg.blur = extra.background.blur;
        }
        if (typeof extra.background.opacity === "number") {
            newBg.opacity = extra.background.opacity;
        }
        if (extra.background.url) {
            newBg.url = extra.background.url;
        }

        Config.setConfig("theme.background", newBg.url);
        Config.setConfig("theme.backgroundBlur", newBg.blur);
        Config.setConfig("theme.backgroundOpacity", newBg.opacity);

        backgroundStore.setValue(newBg);
    }
}

function setColors(colors: Partial<CustomizedColors>) {
    const currentTheme = themeStore.getValue();
    // if (currentTheme.id !== "p-light" && currentTheme.id !== "p-dark") {
        const newTheme = {
            ...currentTheme,
            colors: {
                ...currentTheme.colors,
                ...colors,
            },
        };
        Config.setConfig("theme.customColors", newTheme.colors);
        Config.setConfig("theme.colors", newTheme.colors);
        themeStore.setValue(newTheme);
    // }
}

function setBackground(backgroundInfo: Partial<IBackgroundInfo>) {
    const currentBackgroundInfo = backgroundStore.getValue();
    let newBgInfo = {
        ...(currentBackgroundInfo ?? {
            opacity: 0.6,
            blur: 20,
        }),
    };
    if (typeof backgroundInfo.blur === "number") {
        Config.setConfig("theme.backgroundBlur", backgroundInfo.blur);
        newBgInfo.blur = backgroundInfo.blur;
    }
    if (typeof backgroundInfo.opacity === "number") {
        Config.setConfig("theme.backgroundOpacity", backgroundInfo.opacity);
        newBgInfo.opacity = backgroundInfo.opacity;
    }
    if (backgroundInfo.url !== undefined) {
        Config.setConfig("theme.background", backgroundInfo.url);
        newBgInfo.url = backgroundInfo.url;
    }
    backgroundStore.setValue(newBgInfo);
}

const configableColorKey: Array<keyof CustomizedColors> = [
    "primary",
    "appBar",
    "text",
    "appBarText",
    "musicBarText",
    "musicBar",
    "pageBackground",
    "backdrop",
    "card",
    "placeholder",
    "tabBar",
    "notification",
];


const Theme = {
    setup,
    setTheme,
    setBackground,
    setColors,
    useTheme: themeStore.useValue,
    getTheme: themeStore.getValue,
    useBackground: backgroundStore.useValue,
    configableColorKey,
};

export default Theme;
