'use client';

import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import ChordStepSequencer from "../components/ChordStepSequencer";
import { UnitMeta } from "..";
import { useConfetti } from '@/confetti-provider';
// import { addToast } from "@heroui/toast";
import { Spacer } from "@heroui/spacer";
import { Button } from "@heroui/button";
import { isPitchEqual } from "@/utils/pitchCompare";

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
    const synth = useRef<Tone.PolySynth<Tone.Synth> | null>(null);

    const chordSynthRef = useRef<Tone.PolySynth<Tone.Synth> | null>(null);
    const hihatRef = useRef<Tone.MetalSynth | null>(null);


    // ---------- 初始化 Tone Synth ----------
    useEffect(() => {

        if (typeof window == "undefined")
            return;

        synth.current = new Tone.PolySynth(Tone.Synth, {
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5 },
        }).toDestination();

        chordSynthRef.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 },
        }).toDestination();

        hihatRef.current = new Tone.MetalSynth({
            // frequency: 400,
            envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
        }).toDestination();

        Tone.getTransport().swing = 0.2;

        return () => {
            Tone.getTransport().stop();
            Tone.getTransport().cancel();
        };
    }, []);


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


        if (chord.chordNote.findIndex(item => isPitchEqual(item, note)) >= 0) {
            return (<div className="p-4 flex items-center justify-center h-full border border-gray-400 rounded-full">{noteName}</div>)
        }

        return noteName;
    }

    function chordName({ x }: { x: number; }): React.ReactNode {
        let chord = matrix[x];

        return (<div className="flex items-center justify-center bg-gray-600/50 font-bold text-xl italic ">{chord.disName}</div>)

    }

    const onTrigger = ({ time, x, y, }: { time: number; x: number; y: number; }) => {

        let chord = matrix[x];
        let note = chord.note[y][0];

        synth.current?.triggerAttackRelease(note, "1n", time);

        // addToast({
        //     title: `${time} ${x} -${y}`,
        //     color: "success",
        // })
    };



    function onBeat({ x, time }: { time: number; x: number; }): void {

        //hhat
        hihatRef.current?.triggerAttackRelease("F#3", "16n", time)

        let beatIndex = Math.trunc(x % 4)
        setHighlighted(beatIndex);

        //chordPlay
        if (beatIndex == 0) {
            const barIndex = Math.floor(x / 4);
            const chord = matrix[barIndex]
            chordSynthRef.current?.triggerAttackRelease(chord.chordNote, "1m", time, 0.5 / chord.chordNote.length);
        }
        // addToast({
        //     title: `beat: ${x} `,
        //     color: "success",
        // })
    }

    return (
        <div className="p-8">
            <div className="flex gap-2 mb-4">
                <Button

                    color="success"
                    onPressStart={showConfetti}
                >
                    Realistic
                </Button>
                <Button
                    color="success"
                    onPressStart={start}
                >
                    Play
                </Button>
                <Button
                    color="danger"
                    onPressStart={stop}
                >
                    Stop
                </Button>
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
