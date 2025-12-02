'use client';

import React, { useState } from "react";
import * as Tone from "tone";
import ChordStepSequencer from "../components/ChordStepSequencer";
import { UnitMeta } from "..";
import { useConfetti } from '@/confetti-provider';
import { addToast } from "@heroui/toast";
import { Spacer } from "@heroui/spacer";

export const meta: UnitMeta = {
    title: 'Unit 11: 12 Bar Blues',
    desc: '即兴练习好帮手，牛的一批',
    bpm: 100,
};

export interface Chord {
    name: string,
    disName: string,
    chordNote: string[]
    note: string[][],
}

const C7: Chord = {
    name: "C7",
    disName: "1",
    chordNote: ["C4", "E4", "G4", "Bb4"],
    note: [["C4", "1"], ["D4", "2"], ["E4", "3"], ["F4", "4"], ["G4", "5"], ["A4", "6"], ["Bb4", "b7"], ["C5", "1"]],
};

const F7: Chord = {
    name: "F7",
    disName: "4",
    chordNote: ["F4", "A4", "C4", "Eb4"],
    note: [["C4", "1"], ["D4", "2"], ["Eb4", "b3"], ["F4", "4"], ["G4", "5"], ["A4", "6"], ["Bb4", "b7"], ["C5", "1"]],
};

const G7: Chord = {
    name: "G7",
    disName: "5",
    chordNote: ["G4", "B4", "D4", "F4"],
    note: [["C4", "1"], ["D4", "2"], ["E4", "3"], ["F4", "4"], ["G4", "5"], ["A4", "6"], ["B4", "7"], ["C5", "1"]],
};

const matrix: Chord[] = [
    C7, C7, C7, C7,
    F7, F7, C7, C7,
    G7, F7, C7, G7,

    // C7, C7, C7, C7,
    // F7, F7, C7, C7,
    // G7, F7, C7, G7,
];

const App: React.FC = () => {
    const [highlighted, setHighlighted] = useState<number>(-1);
    const fire = useConfetti();
    const synth = typeof window !== "undefined" ? new Tone.PolySynth().toDestination() : undefined;


    const start = async () => {
        await Tone.start();
        Tone.getTransport().bpm.value = meta.bpm;
        Tone.getTransport().start();
    };

    const showConfetti = () => {
        fire();
    };

    const stop = () => {
        setHighlighted(-1);
        Tone.getTransport().stop();
    }


    function cellName({ x, y }: { x: number; y: number; }): React.ReactNode {
        let chord = matrix[x];
        let note = chord.note[y][0];
        let noteName = chord.note[y][1];

        if (chord.chordNote.includes(note)) {
            return (<div className="p-4 flex items-center justify-center h-full border border-gray-300 rounded-full">{noteName}</div>)
        }

        return noteName;
    }

    function chordName({ x }: { x: number; }): React.ReactNode {
        let chord = matrix[x];
        return chord.disName;
    }

    const onTrigger = ({ time, x, y, }: { time: number; x: number; y: number; }) => {

        let chord = matrix[x];
        let note = chord.note[y][0];

        synth?.triggerAttackRelease(note, "1n", time);

        addToast({
            title: `${time} ${x} -${y}`,
            color: "success",
        })
    };



    function onBeat({ x, }: { time: number; x: number; }): void {

        let beatIndex = Math.trunc(x % 4)
        setHighlighted(beatIndex);
        // addToast({
        //     title: `beat: ${x} `,
        //     color: "success",
        // })
    }

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
            <ChordStepSequencer xLen={matrix.length} yLen={8} subdivision="4n" beatsPerChord={4} onTrigger={onTrigger} onBeat={onBeat} cellName={cellName} chordName={chordName} />
            <Spacer y={4}></Spacer>

            <div className="overflow-x-auto grid grid-flow-col auto-cols-auto  items-center ">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index}
                        className={`h-4 border m-0.5 space-y-1 min-w-10  transition-all duration-100 ${index === highlighted ? "bg-orange-300/50 rounded" : ""} `} >
                        <div className=""> </div>
                    </div>
                ))}

            </div>


            <div className="flex items-center justify-center gap-2 h-12">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className={`
                            w-3 h-3 rounded-full border border-gray-400 dark:border-gray-500
                            transition-all duration-200 ease-in-out
                            ${index === highlighted
                                ? 'bg-orange-500 scale-150 shadow-lg shadow-orange-500/50'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }
                        `}
                    />
                ))}
            </div>

            <div className="flex items-end justify-center gap-2 h-12 px-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className={`
                            w-10 rounded-t-md border border-gray-400 dark:border-gray-600
                            transition-all duration-300 ease-out
                            ${index === highlighted
                                ? 'h-12 bg-gradient-to-t from-orange-400 to-orange-500 shadow-xl'
                                : 'h-6 bg-gray-300 dark:bg-gray-700'
                            }
                        `}
                    />
                ))}
            </div>

            <div className="flex items-center justify-center gap-3 h-16">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className={`
                            relative w-4 h-4 rounded-full
                            ${index === highlighted ? 'animate-ping' : ''}
                        `}
                    >
                        <div
                            className={`
                                absolute inset-0 rounded-full
                                ${index === highlighted
                                    ? 'bg-orange-500 shadow-lg shadow-orange-500/50'
                                    : 'bg-gray-400 dark:bg-gray-500'
                                }`
                            }
                        />
                        <div
                            className={`w-full h-full rounded-full border-2
                                        ${index === highlighted
                                    ? 'border-orange-500 animate-pulse'
                                    : 'border-gray-400 dark:border-gray-600'
                                }`
                            }
                        />
                    </div>
                ))}
            </div>


            <div className="flex items-center justify-center gap-4 h-12">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className={`
                            flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold
                            transition-all duration-200
                            ${index === highlighted
                                ? 'bg-orange-500 text-white scale-110 shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }
                        `}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>

        </div >
    );
};

export default App;