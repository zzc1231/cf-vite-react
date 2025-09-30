'use client';


import { NumberInput } from "@heroui/number-input";
import { Button } from '@heroui/button';
import { RadioGroup, Radio } from "@heroui/radio";

import { useEffect, useRef, useState } from "react";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";
import { useLocalStorage } from "@/utils/localStorage";
import { useDisclosure } from "@heroui/use-disclosure";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";

import { ThemeSwitch } from "@/components/theme-switch";
import EarTrainingPanel, { EarTrainingRef } from "./componemts/earTeanningPanel";
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
        keyLibrary: ['C', '', 'D', '', 'E', 'F', '', 'G', '', 'A', '', 'B'],
        melodyLibrary: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
    }],
    ["C Minor", {
        keyLibrary: ['C', '', 'D', 'Eb', '', 'F', '', 'G', 'Ab', '', 'Bb', ''],
        melodyLibrary: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4'],
    }]
])

const Page = () => {
    const settingModal = useDisclosure();

    const [config, setConfig] = useLocalStorage<ToneConfig>("tone.config", { bpm: 120, melodyLength: 4, scaleName: scaleMap.keys().next().value ?? "" })
    const [record, setRecord] = useLocalStorage<ToneRecord>("tone.record", { totalExercises: 0, totalSuccesses: 0 })
    const [successRate, setSuccessRate] = useState<number>(0);

    const earRef = useRef<EarTrainingRef>(null);


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

        earRef.current?.reset()

    }, [config]);


    const clearScore = () => {
        record.totalExercises = 0;
        record.totalSuccesses = 0;
        setRecord({ totalExercises: 0, totalSuccesses: 0 });
    }


    const onAnswer = ({ correct, question, answer }: { correct: boolean; question: string[]; answer: string[] }) => {
        console.log(correct, question, answer)
        setRecord({
            ...record,
            totalSuccesses: record.totalSuccesses + (correct ? 1 : 0),
            totalExercises: record.totalExercises + 1
        })

        if (correct) {
            earRef.current?.newQuestion();
        }
    }


    return (
        <BlankLayout>
            <section className="h-full flex flex-col items-center  gap-4">
                <Navbar>
                    <NavbarContent justify="center">
                        <NavbarItem >
                            <div className="font-bold text-default-500 flex space-x-6 justify-center">
                                <p>{config.scaleName}</p>
                            </div>
                        </NavbarItem>
                    </NavbarContent>
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
                                <Cog8ToothIcon className="self-center w-6 h-6"></Cog8ToothIcon>
                            </Button>
                            <ThemeSwitch className="p-2"></ThemeSwitch>
                        </NavbarItem>
                    </NavbarContent>

                </Navbar>
                <div className=" space-y-2  justify-center w-full  px-4 pt-2">

                    <EarTrainingPanel
                        ref={earRef}
                        refrenceNote={scaleMap.get(config?.scaleName)?.melodyLibrary[0] ?? "C4"}
                        noteRange={scaleMap.get(config?.scaleName)?.melodyLibrary ?? []}
                        melodyLength={config.melodyLength}
                        bpm={config.bpm}
                        customKeyNames={scaleMap.get(config?.scaleName)?.keyLibrary}
                        onAnswer={onAnswer}
                    ></EarTrainingPanel>
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
