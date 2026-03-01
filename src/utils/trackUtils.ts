import {State} from "react-native-track-player";
import {trace} from "@/utils/log";

/**
 * 音乐是否处于停止状态
 * @param state
 * @returns
 */
export const musicIsPaused = (state: State | undefined) =>
    state !== State.Playing;

/**
 * 音乐是否处于缓冲中状态
 * @param state
 * @returns
 */
export const musicIsBuffering = (state: State | undefined) => {
    trace("播放状态", state)
    return state === State.Loading || state === State.Buffering;
}
