import React, {useEffect, useState} from "react";
import {ImageRequireSource} from "react-native";
import {Image, ImageProps} from "expo-image";
import {errorLog} from "@/utils/log";

interface IImageProps {
    style: ImageProps["style"];
    defaultSource?: ImageProps["defaultSource"];
    placeholderSource?: ImageRequireSource;
    source?: ImageProps["source"] | string;
}
export default function (props: IImageProps) {
    const { style, placeholderSource, defaultSource, source } = props ?? {};
    const [isError, setIsError] = useState(false);


    let realSource: IImageProps["source"];
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
                setIsError(true);
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
        <Image
            style={style}
            source={isError ? placeholderSource : realSource}
            onError={() => {
                setIsError(true);
                console.error("Image load error:", realSource);
            }}
            defaultSource={defaultSource}
            placeholder={defaultSource}
        />
    );
}
