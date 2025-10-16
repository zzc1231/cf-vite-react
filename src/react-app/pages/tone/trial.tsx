'use client';


import { NumberInput } from "@heroui/number-input";
import { Button } from '@heroui/button';
import { RadioGroup, Radio } from "@heroui/radio";
import { Alert } from "@heroui/alert";

import { useEffect, useRef, useState } from "react";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";
import { useLocalStorage } from "@/utils/localStorage";
import { useDisclosure } from "@heroui/use-disclosure";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";

import { ThemeSwitch } from "@/components/theme-switch";
import EarTrainingPanel, { EarTrainingRef } from "./componemts/earTeanningPanel";
import DefaultLayout from "@/layouts/default";
import { Spacer } from "@heroui/spacer";
import Joyride, { Step } from "react-joyride-react19-compat";

interface ToneConfig {
    bpm: number;
    melodyLength: number;
    scaleName: string
}

interface DailyTrial {
    used: number;
    succ: number;
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
    }],
    // 自然小调，但第6级升高
    ["C Dorian", {
        keyLibrary: ['C', '', 'D', 'Eb', '', 'F', '', 'G', '', 'A', 'Bb', ''],
        melodyLibrary: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4'],
    }],
    // 小调音阶，第2级降半音，有西班牙味道
    ["C Phrygian", {
        keyLibrary: ['C', 'Db', '', 'Eb', '', 'F', '', 'G', 'Ab', '', 'Bb'],
        melodyLibrary: ['C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4'],
    }],
    // 大调音阶，第4级升半音，有明亮感
    ["C Lydian", {
        keyLibrary: ['C', '', 'D', '', 'E', '', 'F#', 'G', '', 'A', '', 'B'],
        melodyLibrary: ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4'],
    }],
    // 大调音阶，第7级降半音，有民谣味道
    ["C Mixolydian", {
        keyLibrary: ['C', '', 'D', '', 'E', 'F', '', 'G', '', 'A', 'Bb', ''],
        melodyLibrary: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4'],
    }],
    // 自然小调
    ["C Aeolian", {
        keyLibrary: ['C', '', 'D', 'Eb', '', 'F', '', 'G', 'Ab', '', 'Bb'],
        melodyLibrary: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4'],
    }],
    // 小调，第2级降半音，第5级降半音，很不稳定
    ["C Locrian", {
        keyLibrary: ['C', 'Db', '', 'Eb', '', 'F', 'Gb', '', 'Ab', '', 'Bb'],
        melodyLibrary: ['C4', 'Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4'],
    }],
])

const Page = () => {
    const settingModal = useDisclosure();
    const trailModal = useDisclosure({ defaultOpen: true });

    const dailyLimit = 30;

    const [config, setConfig] = useLocalStorage<ToneConfig>("tone.config", { bpm: 120, melodyLength: 4, scaleName: scaleMap.keys().next().value ?? "" })
    const [record, setRecord] = useLocalStorage<DailyTrial>(`tone.todayTrail_${new Date().getMonth()}_${new Date().getDate()}`, { used: 0, succ: 0 })
    const [successRate, setSuccessRate] = useState<number>(0);

    const earRef = useRef<EarTrainingRef>(null);

    const initialSteps: Step[] = [
        {
            content: "开始吧！",
            placement: 'center',
            target: 'body',
        },
        {
            target: '#btn_readyPlay',
            content: '先调好音量哦~',
            placement: 'top',
        },
        {
            target: '#btn_startTrian',
            content: '准备好就开始训练！',
            placement: 'top',
        },

        {
            title: '第1个音',
            content: "选 C",
            target: '#btn_key_0',
            placement: 'bottom',
        },
        {
            title: '第2个音',
            content: "选 E",
            target: '#btn_key_4',
            placement: 'bottom',
        },
        {
            title: '第3个音',
            content: "选 G",
            target: '#btn_key_7',
            placement: 'bottom',
        },
        {
            title: '第4个音',
            content: "选 B",
            target: '#btn_key_11',
            placement: 'bottom',
        },
        {
            title: '提交答案',
            content: "提交看看结果",
            target: '#btn_sureAnswer',
            placement: 'top',
        },
        {
            title: '答案区',
            content: "这里查看对错",
            target: '#div_anwserPanel',
            placement: 'bottom',
        },

        {
            title: '🎉太棒了！你全都学会了🎉',
            content: "继续看看其他功能吧",
            placement: 'center',
            target: 'body',
        },

        {
            title: '播放参考音',
            content: "忘了音高？点这里",
            placement: 'top',
            target: '#btn_playRefrence',
        },
        {
            title: '重放题目',
            content: "再听一遍点这个",
            placement: 'top',
            target: '#btn_replay',
        },
        {
            title: '清除答案',
            content: "做错了也能重来",
            placement: 'top',
            target: '#btn_clearAnswer',
        },
        {
            title: '下一题',
            content: "继续挑战！",
            placement: 'center',
            target: '#btn_nextTrain',
        },

        {
            title: '🎉🎉🎉',
            content: "都学会啦！练耳大师 继续加油哦～",
            placement: 'center',
            target: 'body',
        },

    ];

    const [state, setState] = useState({
        stepsEnabled: false,
        initialStep: 0,
        steps: initialSteps,
    });


    useEffect(() => {

    }, [])

    useEffect(() => {
        if (record.used >= dailyLimit) {
            settingModal.onClose()
            trailModal.onClose()
        }

        let rate = 0;
        if (record.used > 0) {
            rate = (record.succ / record.used) * 100;
        }

        setSuccessRate(rate);
    }, [record]);

    useEffect(() => {

        if (!config.melodyLength)
            return;

        earRef.current?.reset()

    }, [config]);


    const onAnswer = ({ correct, question, answer }: { correct: boolean; question: string[]; answer: string[] }) => {
        console.log(correct, question, answer)

        if (correct) {
            setRecord({
                ...record,
                succ: record.succ + 1,
            })

            earRef.current?.newQuestion();
        }
    }

    const onNewQuestion = () => {

        setRecord({
            ...record,
            used: record.used + 1,
        })

        fetch("/done", { method: "POST" })
    }


    const startTrial = () => {

        // setRecord({
        //     ...record,
        //     used: 0,
        // })
        // trailModal.onClose()
        // setState({ ...state, stepsEnabled: true })
        fetch("/todayFirst")
            .then(res => res.json() as Promise<{ count: number }>)
            .then((data) => {
                setRecord({
                    ...record,
                    used: data.count,
                })
                trailModal.onClose()
                setState({ ...state, stepsEnabled: data.count == 0 })
            })
    }

    // function joyrideCallback(data: CallBackProps): void {
    //     const {
    //         // action,
    //         // index,
    //         // type,
    //         // status,
    //         step
    //     } = data;
    //     if (step.target.toString().startsWith("#")) {
    //         document.getElementById(step.target.toString())?.click()
    //     }
    // }

    return (
        <DefaultLayout>
            <section className="h-full flex flex-col items-center ">
                <Joyride
                    steps={state.steps}
                    run={state.stepsEnabled}
                    continuous
                    // showSkipButton
                    disableOverlayClose
                    hideCloseButton
                    showProgress
                    spotlightClicks
                    // callback={joyrideCallback}
                    locale={{
                        back: '上一步',
                        close: '关闭',
                        last: '完成',
                        next: '下一步',
                        skip: '跳过',
                        nextLabelWithProgress: '下一步 ( {step} / {steps} )',
                    }}
                />



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
                                <p>{record.succ} / {record.used}</p>
                                <p>{successRate.toFixed(2)}%</p>
                            </div>
                        </NavbarItem>
                    </NavbarContent>
                    <NavbarContent justify="end">
                        <NavbarItem>
                            <Button isIconOnly onPressUp={settingModal.onOpen} variant="light">
                                <Cog8ToothIcon className="self-center w-6 h-6 bg-transparent"></Cog8ToothIcon>
                            </Button>
                            <ThemeSwitch className="p-2"></ThemeSwitch>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>
                <div className="flex flex-col  w-full  px-4 pt-2 gap-y-6">

                    <Alert description={`今日剩余次数：${dailyLimit - record.used}`} color="default" variant="flat" />

                    {!trailModal.isOpen && record.used < dailyLimit && <EarTrainingPanel
                        ref={earRef}
                        refrenceNote={scaleMap.get(config?.scaleName)?.melodyLibrary[0] ?? "C4"}
                        noteRange={scaleMap.get(config?.scaleName)?.melodyLibrary ?? []}
                        melodyLength={config.melodyLength}
                        bpm={config.bpm}
                        customKeyNames={scaleMap.get(config?.scaleName)?.keyLibrary}
                        onAnswer={onAnswer}
                        onNewQuestion={onNewQuestion}
                    ></EarTrainingPanel>
                    }

                    <Alert title="体验" description="体验阶段限制说明" color="warning" variant="flat" />

                </div >

                <Modal
                    size="full"
                    // placement="center"
                    backdrop="blur"
                    isOpen={record.used >= dailyLimit}
                    isDismissable={false}
                    hideCloseButton={true}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">使用说明</ModalHeader>
                                <ModalBody>
                                    <Alert title="试用" description="明天再来" color="warning" variant="flat" />
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                                        risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                                        quam.
                                    </p>
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                                        risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                                        quam.
                                    </p>
                                </ModalBody>
                                <ModalFooter className="flex flex-col">
                                    <Button size="lg" className="w-full" onPress={onClose}>成为会员</Button>
                                    <Spacer y={8}></Spacer>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>


                <Modal
                    backdrop="blur"
                    isOpen={trailModal.isOpen}
                    onOpenChange={trailModal.onOpenChange}
                    isDismissable={false}
                    hideCloseButton={true}
                >
                    <ModalContent>
                        {() => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">使用说明</ModalHeader>
                                <ModalBody>

                                    <Alert title="试用" description="试用" color="warning" variant="flat" />
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                                        risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                                        quam.
                                    </p>
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                                        risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                                        quam.
                                    </p>

                                </ModalBody>
                                <ModalFooter>
                                    <Button onPress={startTrial}>开始试用</Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
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
        </DefaultLayout >
    );
}

export default Page;
