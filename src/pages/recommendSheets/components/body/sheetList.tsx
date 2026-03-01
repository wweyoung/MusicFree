import React, {memo, useCallback} from "react";
import rpx from "@/utils/rpx";
import {FlashList} from "@shopify/flash-list";
import useRecommendSheets from "../../hooks/useRecommendSheets";
import SheetItem from "@/components/mediaItem/sheetItem";
import ListEmpty from "@/components/base/listEmpty";
import ListFooter from "@/components/base/listFooter";
import {useWindowDimensions} from "react-native";

interface ISheetListProps {
    tag: ICommon.IUnique;
    pluginHash: string;
}

function SheetList(props: ISheetListProps) {
    const { tag, pluginHash } = props ?? {};

    const [query, sheets, status] = useRecommendSheets(pluginHash, tag);

    function renderItem({ item }: { item: IMusic.IMusicSheetItemBase }) {
        return <SheetItem sheetInfo={item} pluginHash={pluginHash} />;
    }

    const keyExtractor = useCallback(
        (item: any, i: number) => `${i}-${item.platform}-${item.id}`,
        [],
    );

    const { width } = useWindowDimensions();

    // 计算列数：至少 1 列，最多根据宽度自动
    const numColumns = Math.max(1, Math.floor(width / rpx(250)));

    return (
        <FlashList
            ListEmptyComponent={<ListEmpty state={status} onRetry={query} />}
            ListFooterComponent={
                sheets.length ? <ListFooter
                    state={status}
                    onRetry={query}
                /> : null
            }
            onEndReached={() => {
                query();
            }}
            onEndReachedThreshold={0.1}
            estimatedItemSize={rpx(306)}
            numColumns={numColumns}
            renderItem={renderItem}
            data={sheets}
            keyExtractor={keyExtractor}
        />
    );
}

export default memo(
    SheetList,
    (prev, curr) =>
        prev.tag.id === curr.tag.id && prev.pluginHash === curr.pluginHash,
);
