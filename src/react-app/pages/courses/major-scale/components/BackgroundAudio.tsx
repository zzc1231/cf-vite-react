import { useRef, useImperativeHandle, forwardRef } from "react";

export interface BackgroundAudioHandle {
    play: () => Promise<void>;
    stop: () => void;
}

interface BackgroundAudioProps {
    duration?: number; // 静音音频时长，默认 1 秒
}

const BackgroundAudio = forwardRef<BackgroundAudioHandle, BackgroundAudioProps>(
    ({ duration = 1 }, ref) => {
        const audioCtxRef = useRef<AudioContext | null>(null);
        const sourceRef = useRef<AudioBufferSourceNode | null>(null);
        const audioElRef = useRef<HTMLAudioElement | null>(null);
        const audioURLRef = useRef<string>("");

        /** 生成静音音频并返回 Blob URL */
        const createSilentAudio = (seconds: number) => {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const sampleRate = ctx.sampleRate;
            const frameCount = sampleRate * seconds;

            const buffer = ctx.createBuffer(1, frameCount, sampleRate);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < frameCount; i++) {
                // channelData[i] = 0;
                channelData[i] = Math.sin(2 * Math.PI * 55 * i / sampleRate) * 0.01; // 55Hz 低音，音量极低
            }

            const wavBuffer = encodeWAV(buffer);
            const blob = new Blob([wavBuffer], { type: "audio/wav" });
            return URL.createObjectURL(blob);
        };

        const encodeWAV = (audioBuffer: AudioBuffer) => {
            const numChannels = audioBuffer.numberOfChannels;
            const sampleRate = audioBuffer.sampleRate;
            const samples = audioBuffer.getChannelData(0);
            const buffer = new ArrayBuffer(44 + samples.length * 2);
            const view = new DataView(buffer);

            const writeString = (view: DataView, offset: number, str: string) => {
                for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
            };

            writeString(view, 0, "RIFF");
            view.setUint32(4, 36 + samples.length * 2, true);
            writeString(view, 8, "WAVE");
            writeString(view, 12, "fmt ");
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, numChannels * 2, true);
            view.setUint16(34, 16, true);
            writeString(view, 36, "data");
            view.setUint32(40, samples.length * 2, true);

            let offset = 44;
            for (let i = 0; i < samples.length; i++, offset += 2) {
                const s = Math.max(-1, Math.min(1, samples[i]));
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
            }

            return view;
        };

        // 播放后台音频
        const play = async () => {
            // 生成静音音频 URL
            if (!audioURLRef.current) {
                audioURLRef.current = createSilentAudio(duration);
            }

            // 创建 <audio> 元素
            if (!audioElRef.current) {
                const audio = document.createElement("audio");
                audio.src = audioURLRef.current;
                audio.loop = true;
                // audio.duration = NaN
                audio.volume = 0.001;
                document.body.appendChild(audio);
                audioElRef.current = audio;
            }

            try {
                await audioElRef.current.play();
            } catch (e) {
                console.warn("Audio playback failed:", e);
            }

            // WebAudio 保持 Transport 也可以 optional
            if (!audioCtxRef.current) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioContextClass();
                audioCtxRef.current = ctx;
            }
        };

        const stop = () => {
            audioElRef.current?.pause();
            audioElRef.current?.remove();
            audioElRef.current = null;

            sourceRef.current?.stop();
            sourceRef.current?.disconnect();
            sourceRef.current = null;

            audioCtxRef.current?.close();
            audioCtxRef.current = null;

            if (audioURLRef.current) {
                URL.revokeObjectURL(audioURLRef.current);
                audioURLRef.current = "";
            }
        };

        useImperativeHandle(ref, () => ({
            play,
            stop,
        }));

        return null; // 不渲染 DOM
    }
);

export default BackgroundAudio;
