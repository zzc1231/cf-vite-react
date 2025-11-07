'use client';

import React from "react";
import * as Tone from "tone";
import ToneStepSequencer from "../components/ToneStepSequencer";
import { UnitMeta } from "..";
import { useConfetti } from '@/confetti-provider';

export const meta: UnitMeta = {
    title: 'Unit 10: 步进器 + C△7',
    desc: '牛的一批',
    bpm: 80,
};

const App: React.FC = () => {
    const fire = useConfetti();
    const synth = typeof window !== "undefined" ? new Tone.PolySynth().toDestination() : undefined;

    const onTrigger = (args: any) => {
        console.debug(args);
        const { row, time } = args;
        const notes = ["C4", "E4", "G4", "B4"];
        synth?.triggerAttackRelease(notes[row], "8n", time);
    };

    const start = async () => {
        await Tone.start();
        Tone.getTransport().bpm.value = meta.bpm;
        Tone.getTransport().start();
    };

    const showConfetti = () => {
        fire();
    };

    const stop = () => Tone.getTransport().stop();

    return (
        <div className="p-8">
            <div className="flex gap-2 mb-4">
                <button
                    className="px-4 py-2 bg-red-500 text-white font-bold rounded"
                    onClick={showConfetti}
                >
                    Realistic
                </button>
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