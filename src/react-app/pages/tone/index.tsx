'use client';

import { Snippet } from "@heroui/snippet";
import { NumberInput } from "@heroui/number-input";
import { Button } from '@heroui/button';
import { RadioGroup, Radio } from "@heroui/radio";

import * as Tone from 'tone';
import { useEffect, useState, useRef } from "react";
import { BackspaceIcon, Cog8ToothIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { useLocalStorage } from "@/utils/localStorage";
import { useDisclosure } from "@heroui/use-disclosure";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Spacer } from "@heroui/spacer";
import { ThemeSwitch } from "@/components/theme-switch";
import BlankLayout from "@/layouts/blank";

interface ToneConfig {
    bpm: number;
    melodyLength: number;
    scaleName: string
}

interface ToneRecord {
    totalExercises: number;
    totalSuccesses: number;
}

interface KeyConfig {
    melodyLibrary: string[],
    keyLibrary: string[]
}

const scaleMap: Map<string, KeyConfig> = new Map([
    ["C Major", {
        keyLibrary: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'],
        melodyLibrary: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
    }],
    ["C Minor", {
        keyLibrary: ['C4', 'C#4', 'D4', 'Eb4', 'E4', 'F4', 'F#4', 'G4', 'Ab4', 'A4', 'Bb4', 'B4'],
        melodyLibrary: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4'],
    }]
])

const Page = () => {
    const settingModal = useDisclosure();
    const [melody, setMelody] = useState<string[]>(new Array(4).fill(""));
    const [userClicks, setUserClicks] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

    const [config, setConfig] = useLocalStorage<ToneConfig>("tone.config", { bpm: 120, melodyLength: 4, scaleName: scaleMap.keys().next().value ?? "" })
    const [record, setRecord] = useLocalStorage<ToneRecord>("tone.record", { totalExercises: 0, totalSuccesses: 0 })
    const [successRate, setSuccessRate] = useState<number>(0);

    const [playCount, setPlayCount] = useState<number>(-1);

    useEffect(() => {
        let rate = 0;
        if (record.totalExercises > 0) {
            rate = (record.totalSuccesses / record.totalExercises) * 100;
        }

        setSuccessRate(rate);
    }, [record]);

    useEffect(() => {

        if (!config.melodyLength)
            return;

        setMelody(new Array(config.melodyLength).fill(""))
    }, [config]);

    const synthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            synthRef.current = new Tone.PolySynth().toDestination();
        }
    }, []);

    const synth = () => {
        if (!synthRef.current) {
            synthRef.current = new Tone.PolySynth().toDestination();
        }

        return synthRef.current;
    }


    const clearScore = () => {
        record.totalExercises = 0;
        record.totalSuccesses = 0;
        setRecord({ totalExercises: 0, totalSuccesses: 0 });
    }


    const startExercise = () => {
        let melodyLibrary = scaleMap.get(config.scaleName)?.melodyLibrary;

        if (!melodyLibrary)
            return;

        // 生成随机旋律
        const randomMelody: string[] = [];
        for (let i = 0; i < config.melodyLength; i++) {
            const randomIndex = Math.floor(Math.random() * melodyLibrary.length);
            randomMelody.push(melodyLibrary[randomIndex]);
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
        Tone.getTransport().bpm.value = config.bpm;
        Tone.getTransport().start();

        //回调
        Tone.getTransport().scheduleOnce(() => {
            setIsPlaying(false);
            part.dispose();  // 清理 Part 实例
            // Tone.getTransport().stop();
        }, `+${(melody.length) * Tone.Time("4n").toSeconds()}`);
    };

    const handleNoteButtonClick = async (note: string) => {
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
                synth().triggerAttackRelease(note, "8n", Tone.now() + 0.05);
            }

        }
    };

    const handleNoteButtonPressEnd = async (note: string) => {

        //播放中 'C' 调在8个音符的持续时间内
        synth().triggerRelease(note);

    };

    const submitAnswer = () => {
        // 检查用户答案是否正确
        if (userClicks.length === melody.length) {
            const isCorrect = userClicks.every((click, index) => click === melody[index]);
            setIsAnswerCorrect(isCorrect);

            setRecord({
                ...record,
                totalSuccesses: record.totalSuccesses + (isCorrect ? 1 : 0),
                totalExercises: record.totalExercises + 1
            })

            if (isCorrect) {
                startExercise();
            }
        }
    };

    async function clickC() {
        await Tone.start();
        setPlayCount(playCount + 1);
        //创建一个synth并将其连接到主输出设备(您的扬声器)

        //播放中 'C' 调在8个音符的持续时间内
        var key = scaleMap.get(config?.scaleName)?.keyLibrary[0] ?? "C4"
        synth().triggerAttackRelease(key, "8n", Tone.now() + 0.05);


    }
    return (
        <BlankLayout>
            <section className="h-full flex flex-col items-center  gap-4">
                <Navbar>
                    <NavbarContent justify="center">
                        <NavbarItem >
                            <div className="font-bold text-default-400 flex space-x-6 justify-center">
                                <p>{record.totalSuccesses} / {record.totalExercises}</p>
                                <p>{successRate.toFixed(2)}%</p>
                            </div>
                        </NavbarItem>

                    </NavbarContent>
                    <NavbarContent justify="end">
                        <NavbarItem>
                            <Button isIconOnly onPressUp={settingModal.onOpen} variant="light">
                                <Cog8ToothIcon className="self-center w-5 h-5"></Cog8ToothIcon>
                            </Button>
                            <ThemeSwitch className="p-2"></ThemeSwitch>
                        </NavbarItem>

                    </NavbarContent>

                </Navbar>
                <div className=" space-y-2  justify-center  w-[90%]  lg:min-w-[50%] ">

                    <div className="overflow-x-auto  space-y-2" >
                        <div className="grid grid-flow-col auto-cols-auto gap-1 items-center ">
                            {melody.map((note, index) => (
                                <div className="flex flex-col space-y-1" key={index}>
                                    <Snippet
                                        className="text-lg font-bold justify-center px-0"
                                        hideCopyButton hideSymbol >
                                        {isAnswerCorrect == null ? "*" : note}
                                    </Snippet>

                                    <Snippet
                                        className="text-lg font-bold  justify-center px-0"
                                        hideCopyButton
                                        hideSymbol
                                        color={isAnswerCorrect == null ? "default" : (note == userClicks[index] ? "success" : "danger")}
                                    >
                                        {userClicks.length > index ? userClicks[index] : "_"}
                                    </Snippet>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Spacer y={4}></Spacer>

                    <div className="grid grid-cols-3 gap-y-1 gap-x-1 items-stretch">
                        {scaleMap.get(config?.scaleName)?.keyLibrary.map((note, index) => (
                            <Button
                                key={index}
                                onPressStart={() => handleNoteButtonClick(note)}
                                onPressEnd={() => handleNoteButtonPressEnd(note)}
                                size="lg"
                                radius="sm"
                                // variant="flat"
                                color={(isAnswerCorrect == null || !melody.includes(note)) ? "default" : (userClicks.includes(note) ? "success" : "danger")}
                                isDisabled={!scaleMap.get(config?.scaleName)?.melodyLibrary.includes(note)}
                            >
                                {note}
                            </Button>
                        ))}
                    </div>

                    <Spacer y={2}></Spacer>

                    <div className="grid grid-cols-2 gap-2 h-12">
                        <Button size="lg" onPress={startExercise} isDisabled={isPlaying}> 下一条 </Button>
                        <Button size="lg" onPress={submitAnswer} color="primary" variant="flat"> 确定 </Button>
                    </div>

                    <Spacer y={6}></Spacer>

                    <div className="grid grid-cols-3 gap-2">
                        <Button size="lg" onPress={clickC} isDisabled={isPlaying} startContent={<PlayCircleIcon />}> {scaleMap.get(config?.scaleName)?.keyLibrary[0]} </Button>
                        <Button size="lg" onPress={() => playMelody(melody)} isDisabled={isPlaying} startContent={<PlayCircleIcon />}> </Button>
                        <Button size="lg" onPress={() => setUserClicks([])} isDisabled={isPlaying} startContent={<BackspaceIcon />}>  </Button>
                    </div>

                </div >

                <Modal
                    isOpen={settingModal.isOpen}
                    backdrop="blur"
                    placement="auto"
                    shouldBlockScroll={false}
                    onOpenChange={settingModal.onOpenChange}
                >
                    <ModalContent>
                        {() => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">训练配置</ModalHeader>
                                <ModalBody>
                                    <RadioGroup
                                        label="音阶选择"
                                        orientation="horizontal"
                                        value={config.scaleName}
                                        onValueChange={(data) => setConfig({ ...config, scaleName: data })}
                                    >
                                        {Array.from(scaleMap.keys()).map((variant) => (
                                            <Radio key={variant} value={variant} className="capitalize">
                                                {variant}
                                            </Radio>
                                        ))}
                                    </RadioGroup>
                                    <NumberInput
                                        type="number"
                                        // autoFocus
                                        endContent={
                                            <p>BPM</p>
                                        }
                                        label="播放速度"
                                        description="控制乐句BPM"
                                        variant="bordered"
                                        min={10}
                                        value={config.bpm}
                                        onValueChange={(data) => setConfig({ ...config, bpm: data })}
                                    />
                                    <NumberInput
                                        endContent={
                                            <p>音</p>
                                        }
                                        label="乐句长度"
                                        description="控制随机乐句长度"
                                        placeholder="controll Melody length"
                                        type="number"
                                        variant="bordered"
                                        value={config.melodyLength}
                                        min={1}
                                        onValueChange={(data) => setConfig({ ...config, melodyLength: data })}
                                    />
                                    <Button size="lg" onPaste={clearScore} > 重置得分 </Button>
                                    <div className="flex py-2 px-1 justify-between">
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </section>
        </BlankLayout>
    );
}

export default Page;
