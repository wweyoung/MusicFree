import React, {useEffect, useState} from "react";
import {ImageRequireSource} from "react-native";
import FastImage, {FastImageProps} from "react-native-fast-image";
import {ImgAsset} from "@/constants/assetsConst";
import {errorLog} from "@/utils/log";

interface IFastImageProps {
    style: FastImageProps["style"];
    defaultSource?: FastImageProps["defaultSource"];
    placeholderSource?: ImageRequireSource;
    source?: FastImageProps["source"] | string;
}
export default function (props: IFastImageProps) {
    const { style, placeholderSource = ImgAsset.albumDefault, defaultSource, source } = props ?? {};
    const [isError, setIsError] = useState(false);


    let realSource: FastImageProps["source"] = placeholderSource;
    if (typeof source === "string") {
        if (source.length > 0) {
            try {
                let url = new URL(source);
                realSource = {
                    uri: source,
                    headers: {
                        'Host': url.host,
                        'Referer': url.origin
                    }
                };
            } catch (e) {
                errorLog("图片url解析失败", e);
            }
        }
    } else if (source){
        realSource = source;
    }

    useEffect(() => {
        setIsError(false);
    }, [source]);


    return (
        <FastImage
            style={style}
            source={isError ? placeholderSource : realSource}
            onError={() => {
                setIsError(true);
                console.error("Image load error:", realSource);
            }}
            defaultSource={defaultSource}
        />
    );
}
