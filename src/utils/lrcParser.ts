const timeReg = /\[[\d:.]+\]/g;
const metaReg = /\[(.+):(.+)\]/g;

type LyricMeta = Record<string, any>;

interface IOptions {
    musicItem?: IMusic.IMusicItem;
    lyricSource?: ILyric.ILyricSource;
    translation?: string;
    extra?: Record<string, any>;
}

export interface IParsedLrcItem {
    /** 时间 s */
    time: number;
    /** 歌词 */
    lrc: string;
    /** 翻译 */
    translation?: string;
    /** 位置 */
    index: number;
    /* 时长 */
    duration: number
}

export default class LyricParser {
    private _musicItem?: IMusic.IMusicItem;

    private meta: LyricMeta;
    private lrcItems: Array<IParsedLrcItem>;

    private extra: Record<string, any>;

    private lastSearchIndex = 0;

    public hasTranslation = false;
    public lyricSource?: ILyric.ILyricSource;

    get musicItem() {
        return this._musicItem;
    }

    constructor(raw: string, options?: IOptions) {
        // init
        this._musicItem = options?.musicItem;
        this.extra = options?.extra || {};
        this.lyricSource = options?.lyricSource;

        let translation = options?.translation;
        if (!raw && translation) {
            raw = translation;
            translation = undefined;
        }

        const { lrcItems, meta, hasTranslation = false } = this.parseLyricImpl(raw, Boolean(translation));
        this.hasTranslation = hasTranslation;
        if (this.extra.offset) {
            meta.offset = (meta.offset ?? 0) + this.extra.offset;
        }
        this.meta = meta;
        this.lrcItems = lrcItems;

        if (translation) {
            this.hasTranslation = true;
            const transLrcItems = this.parseLyricImpl(translation, this.hasTranslation).lrcItems;

            // 2 pointer
            let p1 = 0;
            let p2 = 0;
            let transCount = 0;
            while (p1 < this.lrcItems.length) {
                const lrcItem = this.lrcItems[p1];
                while (
                    transLrcItems[p2].time < lrcItem.time &&
                    p2 < transLrcItems.length - 1
                ) {
                    ++p2;
                }
                if (transLrcItems[p2].time === lrcItem.time && lrcItem.lrc !== transLrcItems[p2].lrc) {
                    lrcItem.translation = transLrcItems[p2].lrc;
                    transCount++;
                } else if (!lrcItem.translation) {
                    lrcItem.translation = undefined;
                }

                ++p1;
            }
            if (!transCount) {
                this.hasTranslation = false;
            }
        }
    }

    getPosition(position: number): IParsedLrcItem | null {
        position = position - (this.meta?.offset ?? 0);
        let index;
        /** 最前面 */
        if (!this.lrcItems[0] || position < this.lrcItems[0].time) {
            this.lastSearchIndex = 0;
            return null;
        }
        for (
            index = this.lastSearchIndex;
            index < this.lrcItems.length - 1;
            ++index
        ) {
            if (
                position >= this.lrcItems[index].time &&
                position < this.lrcItems[index + 1].time
            ) {
                this.lastSearchIndex = index;
                return this.lrcItems[index];
            }
        }

        for (index = 0; index < this.lastSearchIndex; ++index) {
            if (
                position >= this.lrcItems[index].time &&
                position < this.lrcItems[index + 1].time
            ) {
                this.lastSearchIndex = index;
                return this.lrcItems[index];
            }
        }

        index = this.lrcItems.length - 1;
        this.lastSearchIndex = index;
        return this.lrcItems[index];
    }

    getLyricItems() {
        return this.lrcItems;
    }

    getMeta() {
        return this.meta;
    }

    toString(options?: {
        withTimestamp?: boolean;
        type?: "raw" | "translation";
    }) {
        const { type = "raw", withTimestamp = true } = options || {};

        if (withTimestamp) {
            return this.lrcItems
                .map(
                    item =>
                        `${this.timeToLrctime(item.time)} ${
                            type === "raw" ? item.lrc : item.translation
                        }`,
                )
                .join("\r\n");
        } else {
            return this.lrcItems
                .map(item => (type === "raw" ? item.lrc : item.translation))
                .join("\r\n");
        }
    }

    /** [xx:xx.xx] => x s */
    private parseTime(timeStr: string): number {
        let result = 0;
        const nums = timeStr.slice(1, timeStr.length - 1).split(":");
        for (let i = 0; i < nums.length; ++i) {
            result = result * 60 + +nums[i];
        }
        return result;
    }
    /** x s => [xx:xx.xx] */
    private timeToLrctime(sec: number) {
        const min = Math.floor(sec / 60);
        sec = sec - min * 60;
        const secInt = Math.floor(sec);
        const secFloat = sec - secInt;
        return `[${min.toFixed(0).padStart(2, "0")}:${secInt
            .toString()
            .padStart(2, "0")}.${secFloat.toFixed(2).slice(2)}]`;
    }

    private parseMetaImpl(metaStr: string) {
        if (metaStr === "") {
            return {};
        }
        const metaArr = metaStr.match(metaReg) ?? [];
        const meta: any = {};
        let k, v;
        for (const m of metaArr) {
            k = m.substring(1, m.indexOf(":"));
            v = m.substring(k.length + 2, m.length - 1);
            if (k === "offset") {
                meta[k] = +v / 1000;
            } else {
                meta[k] = v;
            }
        }
        return meta;
    }

    private parseLyricImpl(raw: string, hasTranslation?: boolean) {
        raw = raw.trim();
        const rawLrcItems: {number: IParsedLrcItem[]} = {};
        const rawLrcs = raw.split(timeReg) ?? [];
        const rawTimes = raw.match(timeReg) ?? [];
        const len = rawTimes.length;

        const meta = this.parseMetaImpl(rawLrcs[0].trim());
        rawLrcs.shift();

        let counter = 0;
        let j, lrc;
        for (let i = 0; i < len; ++i) {
            counter = 0;
            while (rawLrcs[0] === "") {
                ++counter;
                rawLrcs.shift();
            }
            lrc = rawLrcs[0]?.trim?.() ?? "";
            for (j = i; j < i + counter; ++j) {
                let time = this.parseTime(rawTimes[j])
                if (!rawLrcItems[time]) rawLrcItems[time] = [];
                rawLrcItems[time].push({
                    time,
                    lrc,
                    index: j,
                    duration: 0
                });
            }
            i += counter;
            if (i < len) {
                let time = this.parseTime(rawTimes[i])
                if (!rawLrcItems[time]) rawLrcItems[time] = [];
                rawLrcItems[time].push({
                    time,
                    lrc,
                    index: j,
                    duration: 0
                });
            }
            rawLrcs.shift();
        }
        let rawLrcItemsEntries = Object.entries(rawLrcItems);
        if (!hasTranslation) {
            let doubleRawLrcItemEntries = rawLrcItemsEntries.filter(([time, lrcItems]) => lrcItems.length === 2);
            if (doubleRawLrcItemEntries.length > rawLrcItemsEntries.length / 2) {
                // 有超过一半歌词都有两份，认为是包含翻译的
                hasTranslation = true;

                doubleRawLrcItemEntries.forEach(([time, lrcItems]) => {
                    // lrcItems[0].translation = lrcItems[1].lrc;
                })
            }
        }
        let lrcItems = rawLrcItemsEntries.map(([time, lrcItems])=>lrcItems[0])
            .sort((a, b) => a.time - b.time);

        lrcItems.forEach((item, index) => {
            item.index = index;
        });
        if (lrcItems.length === 0 && raw.length) {
            lrcItems = raw.split("\n").map((_, index) => ({
                time: 0,
                lrc: _,
                index,
                duration: 0
            }));
        }
        // 计算时长
        for (let i = 0; i < lrcItems.length - 1; i++) {
            lrcItems[i].duration = lrcItems[i + 1].time - lrcItems[i].time;
        }
        return {
            lrcItems,
            meta,
            hasTranslation
        };
    }
}
