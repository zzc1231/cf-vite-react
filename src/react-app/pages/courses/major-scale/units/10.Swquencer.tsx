'use client';

import React, { useEffect } from "react";
import * as Tone from "tone";
import ToneStepSequencer from "../components/ToneStepSequencer";
import { UnitMeta } from "..";


export const meta: UnitMeta = {
    title: 'Unit 10: 步进器 + C△7',
    desc: '牛的一批',
    bpm: 80,
};


const App: React.FC = () => {

    const synth = typeof window !== "undefined" ? new Tone.PolySynth().toDestination() : undefined;

    useEffect(() => {
        // 示例音色：4 行对应 4 种鼓
        // const players = new Tone.Players({
        //     kick: "https://tonejs.github.io/audio/drum-samples/kick.mp3",
        //     snare: "https://tonejs.github.io/audio/drum-samples/snare.mp3",
        //     hh: "https://tonejs.github.io/audio/drum-samples/hh.mp3",
        //     clap: "https://tonejs.github.io/audio/drum-samples/clap.mp3",
        // }).toDestination();

        // const players = new Tone.Players({
        //     urls: {
        //         0: "A1.mp3",
        //         1: "Cs2.mp3",
        //         2: "E2.mp3",
        //         3: "Fs2.mp3",
        //     },
        //     fadeOut: "64n",
        //     baseUrl: "https://tonejs.github.io/audio/casio/",
        // }).toDestination();




        // const onTrigger = (e: Event) => {
        //     console.debug(e)
        //     const { row, time } = (e as CustomEvent<{ time: number; row: number }>)
        //         .detail;
        //     // const names = ["kick", "snare", "hh", "clap"];

        //     // players.player(names[row]).start(time);


        //     synth.triggerAttackRelease(notes[row], "8n", time)
        // };

    }, []);

    const onTrigger = (args: any) => {
        console.debug(args)
        const { row, time } = args
        const notes = ["C4", "E4", "G4", "B4"]
        synth?.triggerAttackRelease(notes[row], "8n", time)
    };

    const start = async () => {
        await Tone.start();
        Tone.getTransport().bpm.value = meta.bpm;
        Tone.getTransport().start();
    };

    const stop = () => Tone.getTransport().stop();

    return (
        <div className="p-8">
            {/* <h1 className="text-2xl mb-4">Tone Step Sequencer（React）</h1> */}
            <div className="flex gap-2 mb-4">
                <button
                    className="px-4 py-2 bg-green-500 text-white font-bold rounded"
                    onClick={start}
                >
                    Play
                </button>
                <button
                    className="px-4 py-2 bg-red-500 text-white font-bold rounded"
                    onClick={stop}
                >
                    Stop
                </button>
            </div>

            <ToneStepSequencer columns={8} rows={4} subdivision="8n" onTrigger={onTrigger} />


        </div>
    );
};

export default App;