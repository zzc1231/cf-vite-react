import React, { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import { UnitMeta } from "..";


export const meta: UnitMeta = {
    title: 'Unit 12: 12 Bar Blues',
    desc: '12bar，牛的一批',
    bpm: 100,
};

const Blues12BarSequencer: React.FC = () => {
    const columns = 12; // 12 小节
    const beatsPerBar = 4;
    const totalSteps = columns * beatsPerBar;

    // 初始化步进器状态
    const [bassSteps, setBassSteps] = useState<boolean[]>(Array(totalSteps).fill(true));
    const [kickSteps, setKickSteps] = useState<boolean[]>(Array(totalSteps).fill(true));
    const [snareSteps, setSnareSteps] = useState<boolean[]>(Array(totalSteps).fill(true));
    const [hihatSteps, setHihatSteps] = useState<boolean[]>(Array(totalSteps).fill(true));

    const chordSynthRef = useRef<Tone.PolySynth | null>(null);
    const bassSynthRef = useRef<Tone.MonoSynth | null>(null);
    const kickRef = useRef<Tone.MembraneSynth | null>(null);
    const snareRef = useRef<Tone.MembraneSynth | null>(null);
    const hihatRef = useRef<Tone.MetalSynth | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);

    // ---------- 初始化 Tone Synth ----------
    useEffect(() => {
        chordSynthRef.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 },
        }).toDestination();

        bassSynthRef.current = new Tone.MonoSynth({
            oscillator: { type: "square" },
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5 },
        }).toDestination();

        kickRef.current = new Tone.MembraneSynth().toDestination();
        snareRef.current = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 10, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination();
        hihatRef.current = new Tone.MetalSynth({
            // frequency: 400,
            envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
        }).toDestination();

        Tone.getTransport().bpm.value = 90;
        Tone.getTransport().swing = 0.2;
        Tone.getTransport().loop = true;
        Tone.getTransport().loopStart = "0:0";
        Tone.getTransport().loopEnd = "12:0";

        return () => {
            Tone.getTransport().stop();
            Tone.getTransport().cancel();
        };
    }, []);

    // ---------- 和弦数据 ----------
    const bluesChords = [
        { chord: ["C3", "E3", "G3", "Bb3"], bars: 4 },
        { chord: ["F3", "A3", "C4", "Eb4"], bars: 2 },
        { chord: ["C3", "E3", "G3", "Bb3"], bars: 2 },
        { chord: ["G3", "B3", "D4", "F4"], bars: 1 },
        { chord: ["F3", "A3", "C4", "Eb4"], bars: 1 },
        { chord: ["C3", "E3", "G3", "Bb3"], bars: 2 },
    ];

    // 生成每小节和弦数组
    const chordTimeline: string[][] = [];
    let currentBar = 0;
    bluesChords.forEach(item => {
        for (let i = 0; i < item.bars; i++) {
            chordTimeline.push(item.chord);
            currentBar++;
        }
    });

    // ---------- 播放器 ----------
    const start = async () => {
        await Tone.start();
        let step = 0;
        new Tone.Loop(time => {
            const barIndex = Math.floor(step / beatsPerBar);
            const beatIndex = step % beatsPerBar;

            // 播放和弦，每小节第一拍
            if (beatIndex === 0) {
                const chord = chordTimeline[barIndex];
                chordSynthRef.current?.triggerAttackRelease(chord, "1m", time);
            }

            // 播放 Bass
            if (bassSteps[step]) {
                bassSynthRef.current?.triggerAttackRelease(chordTimeline[barIndex][0], "8n", time);
            }

            // 播放鼓
            if (kickSteps[step] && beatIndex % 2 === 0) kickRef.current?.triggerAttackRelease("C2", "8n", time);
            if (snareSteps[step] && beatIndex % 2 === 1) snareRef.current?.triggerAttackRelease("D2", "8n", time);
            if (hihatSteps[step]) hihatRef.current?.triggerAttackRelease("F#3", "16n", time);

            step = (step + 1) % totalSteps;
        }, "4n").start(0);

        Tone.getTransport().start();
        setIsPlaying(true);
    };

    const stop = () => {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        setIsPlaying(false);
    };

    // ---------- 点击切换步进器 ----------
    const toggleStep = (type: "bass" | "kick" | "snare" | "hihat", index: number) => {
        switch (type) {
            case "bass":
                setBassSteps(prev => { const copy = [...prev]; copy[index] = !copy[index]; return copy; });
                break;
            case "kick":
                setKickSteps(prev => { const copy = [...prev]; copy[index] = !copy[index]; return copy; });
                break;
            case "snare":
                setSnareSteps(prev => { const copy = [...prev]; copy[index] = !copy[index]; return copy; });
                break;
            case "hihat":
                setHihatSteps(prev => { const copy = [...prev]; copy[index] = !copy[index]; return copy; });
                break;
        }
    };

    return (
        <div>
            <h2>12-bar Blues Sequencer</h2>
            <button onClick={isPlaying ? stop : start}>{isPlaying ? "Stop" : "Play"}</button>

            <h3>Bass</h3>
            <div style={{ display: "flex" }}>{bassSteps.map((v, i) => <div key={i} onClick={() => toggleStep("bass", i)} style={{ width: 20, height: 20, margin: 1, backgroundColor: v ? "green" : "gray" }} />)}</div>

            <h3>Kick</h3>
            <div style={{ display: "flex" }}>{kickSteps.map((v, i) => <div key={i} onClick={() => toggleStep("kick", i)} style={{ width: 20, height: 20, margin: 1, backgroundColor: v ? "red" : "gray" }} />)}</div>

            <h3>Snare</h3>
            <div style={{ display: "flex" }}>{snareSteps.map((v, i) => <div key={i} onClick={() => toggleStep("snare", i)} style={{ width: 20, height: 20, margin: 1, backgroundColor: v ? "blue" : "gray" }} />)}</div>

            <h3>Hi-Hat</h3>
            <div style={{ display: "flex" }}>{hihatSteps.map((v, i) => <div key={i} onClick={() => toggleStep("hihat", i)} style={{ width: 20, height: 20, margin: 1, backgroundColor: v ? "yellow" : "gray" }} />)}</div>
        </div>
    );
};

export default Blues12BarSequencer;
