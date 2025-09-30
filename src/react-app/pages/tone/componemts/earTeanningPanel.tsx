'use client';

import { Snippet } from "@heroui/snippet";
import { Button } from '@heroui/button';
import * as Tone from 'tone';
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { BackspaceIcon, PlayCircleIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useDisclosure } from "@heroui/use-disclosure";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Spacer } from "@heroui/spacer";
import { isPitchEqual } from "@/utils/pitchCompare";



export interface EarTrainingProps {
    /** 随机音符可选范围（必传），例如 ["C2","D2","E2","F2"] */
    noteRange: string[];

    /** 参考音 */
    refrenceNote: string

    /** 随机生成的音符数量（必传） */
    melodyLength: number;

    bpm: number;

    /** 自定义键盘按键名称（选传，不传则默认12平均律） */
    customKeyNames?: string[];

    /** 回调事件：回答提交时触发 */
    onAnswer?: (params: {
        /**是否正确 */
        correct: boolean;
        question: string[];
        answer: string[];
    }) => void;
}

// ✅ 子组件对外暴露的方法类型
export interface EarTrainingRef {
    newQuestion: () => void;   // 例如：重新出题
    playCurrent: () => void;   // 例如：播放当前题目
    reset: () => void;   // 例如：清空答案
}


const Page = forwardRef<EarTrainingRef, EarTrainingProps>((props: EarTrainingProps, ref) => {
    const containerRef = useRef(null);

    const readyModal = useDisclosure({ defaultOpen: true });
    const [melody, setMelody] = useState<string[]>(new Array(4).fill(""));
    const [userClicks, setUserClicks] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

    const [playCount, setPlayCount] = useState<number>(0);

    const btnNameLib = props.customKeyNames || ['C', 'C# _ Db', 'D', 'D# _ Eb', 'E', 'F', 'F# _ Gb', 'G', 'G# _ Ab', 'A', 'A# _ Bb', 'B']
    const noteLib = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4']


    const synthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            synthRef.current = new Tone.PolySynth().toDestination();
        }
    }, []);


    useEffect(() => {

    }, [props.melodyLength]);


    // ✅ 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        newQuestion() {
            startExercise();
        },
        playCurrent() {
            playMelody(melody)
        },
        reset() {
            Tone.getTransport().cancel();
            synth().releaseAll();
            setMelody([])
            setUserClicks([])
        }
    }));

    const synth = () => {
        if (!synthRef.current) {
            synthRef.current = new Tone.PolySynth().toDestination();
            Tone.start();
        }

        return synthRef.current;
    }

    const startExercise = () => {
        // 生成随机旋律
        const randomMelody: string[] = [];
        for (let i = 0; i < props.melodyLength; i++) {
            const randomIndex = Math.floor(Math.random() * props.noteRange.length);
            randomMelody.push(props.noteRange[randomIndex]);
        }

        setMelody(randomMelody);
        setUserClicks([]);
        setIsAnswerCorrect(null)
        playMelody(randomMelody);
    };


    const playMelody = async (melody: string[]) => {
        if (melody[0] == "") {
            return;
        }

        await Tone.start();  // 必须放在用户手势中触发
        setPlayCount(playCount + 1);
        setIsPlaying(true);

        Tone.getTransport().cancel();  // 清除所有预定的事件

        const part = new Tone.Part((time, note) => {
            synth().triggerAttackRelease(note, '4n', time);
        }, melody.map((note, index) => [`0:${index}`, note]));

        part.start();
        part.stop(`+${melody.length}m`);  // 确保 Part 在播放完成后停止

        //拍数
        Tone.getTransport().timeSignature = [melody.length, 4];
        //速度
        Tone.getTransport().bpm.value = props.bpm;
        Tone.getTransport().start();

        //回调
        Tone.getTransport().scheduleOnce(() => {
            setIsPlaying(false);
            part.dispose();  // 清理 Part 实例
            // Tone.getTransport().stop();
        }, `+${(melody.length) * Tone.Time("4n").toSeconds()}`);
    };

    const handleNoteButtonPressStart = async (note: string) => {
        await Tone.start();
        setPlayCount(playCount + 1);
        // 处理音符按钮点击事件
        if (userClicks.length < melody.length) {
            setUserClicks((prevClicks) => [...prevClicks, note]);
        }

        if (!isPlaying) {
            if (playCount > 0) {
                synth().triggerAttack(note, "8n");
            } else {
                synth().triggerAttackRelease(note, "4n", Tone.now() + 0.01);
            }

        }
    };

    const handleNoteButtonPressEnd = async (note: string) => {

        //播放中 'C' 调在8个音符的持续时间内
        synth().triggerRelease(note);

    };

    const submitAnswer = () => {

        if (userClicks.length != melody.length) {
            return
        }

        // 检查用户答案是否正确
        const isCorrect = userClicks.every((click, index) => isPitchEqual(click, melody[index]));
        setIsAnswerCorrect(isCorrect);

        // if (isCorrect) {
        //     startExercise();
        // }
        props.onAnswer && props.onAnswer({
            correct: isCorrect,
            question: melody,
            answer: userClicks
        });

    };

    async function PlayNoteOnce(note: string) {
        await Tone.start();
        setPlayCount(playCount + 1);
        synth().triggerAttackRelease(note, "4n", Tone.now() + 0.05);
    }

    return (
        <section className="h-full w-full flex flex-col items-center  gap-4">
            <div className=" space-y-2  justify-center  lg:min-w-[50%] " ref={containerRef}>
                <div className="overflow-x-auto  space-y-2" >
                    <div className="grid grid-flow-col auto-cols-auto gap-1 items-center ">
                        {Array.from({ length: props.melodyLength }).map((_, index) => (
                            <div className="flex flex-col space-y-1" key={index}>
                                <Snippet
                                    className="text-lg font-bold justify-center px-0"
                                    hideCopyButton hideSymbol >
                                    {isAnswerCorrect == null ? "*" : melody[index]}
                                </Snippet>
                                {userClicks.length > index ?
                                    <Snippet
                                        className="text-lg font-bold  justify-center px-0"
                                        hideCopyButton
                                        hideSymbol
                                        color={isAnswerCorrect == null ? "default" : (isPitchEqual(melody[index], userClicks[index]) ? "success" : "danger")}
                                    >
                                        {userClicks[index]}
                                    </Snippet>
                                    :
                                    <Snippet
                                        className="text-lg font-bold  justify-center px-0"
                                        hideCopyButton
                                        hideSymbol
                                        color={"default"}
                                    >
                                        {"_"}
                                    </Snippet>
                                }
                            </div>
                        ))}
                    </div>
                </div>

                <Spacer y={2}></Spacer>

                <div className="grid grid-cols-3 gap-y-1 gap-x-1 items-stretch">
                    {btnNameLib.map((note, index) => (
                        <Button
                            className="h-15"
                            key={index}
                            onPressStart={() => handleNoteButtonPressStart(noteLib[index])}
                            onPressEnd={() => handleNoteButtonPressEnd(noteLib[index])}
                            size="lg"
                            radius="sm"
                            // variant="flat"
                            color={(isAnswerCorrect == null || !melody.find(v => isPitchEqual(v, noteLib[index]))) ? "default" : (userClicks.find(v => isPitchEqual(v, noteLib[index])) ? "success" : "danger")}
                            isDisabled={!props.noteRange.find(v => isPitchEqual(v, noteLib[index]))}
                        >
                            {note}
                        </Button>
                    ))}
                </div>

                <Spacer y={2}></Spacer>

                <div className="grid grid-cols-2 gap-2 h-12">
                    <Button size="lg" onPress={startExercise} isDisabled={isPlaying}> 下一条 </Button>
                    <Button size="lg" onPress={submitAnswer} isDisabled={melody.length == 0 || userClicks.length != melody.length || isAnswerCorrect != null} color="primary" variant="flat"> 确定 </Button>
                </div>

                <Spacer y={2}></Spacer>

                <div className="grid grid-cols-3 gap-2">
                    <Button size="lg" onPress={() => PlayNoteOnce(props.refrenceNote)} isDisabled={isPlaying} startContent={<PlayIcon width={22} />}> {props.refrenceNote} </Button>
                    <Button size="lg" onPress={() => playMelody(melody)} isDisabled={isPlaying || melody.length == 0} startContent={<PlayCircleIcon width={22} />}> </Button>
                    <Button size="lg" onPress={() => setUserClicks([])} startContent={<BackspaceIcon width={22} />}>  </Button>
                </div>
            </div >

            <Modal
                isOpen={readyModal.isOpen}
                hideCloseButton={true}
                isDismissable={false}
                portalContainer={containerRef.current ?? undefined}
                onOpenChange={readyModal.onOpenChange}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">准备开始</ModalHeader>
                            <ModalBody>
                                <Button size="lg" onPress={() => PlayNoteOnce(props.refrenceNote)} > 播放声音测试 </Button>
                                <Button size="lg" color="primary" variant="shadow" isDisabled={playCount <= 0} onPress={readyModal.onClose} > 我能听到 </Button>

                            </ModalBody>
                            <ModalFooter>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </section>
    );
})

export default Page;
