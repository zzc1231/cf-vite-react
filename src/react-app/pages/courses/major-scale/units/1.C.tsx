'use client';

import { Button } from '@heroui/button';

import { useEffect, useRef, useState } from "react";
import { useDisclosure } from "@heroui/use-disclosure";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { useLocation, useNavigate } from 'react-router-dom'

import { ThemeSwitch } from "@/components/theme-switch";
import EarTrainingPanel, { EarTrainingRef } from "../components/earTeanningPanel";
import Joyride, { ACTIONS, CallBackProps, Events, EVENTS, STATUS, Step } from "react-joyride-react-19";
import { Chip } from "@heroui/chip";
import { UnitMeta } from '..';
import { Progress } from "@heroui/progress";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { Icon } from '@iconify/react';
import { addToast, closeToast } from '@heroui/toast';
import { useConfetti } from '@/confetti-provider';

import * as Tone from 'tone';


export const meta: UnitMeta = {
    title: 'Unit 1: 认识 C',
    desc: '认识 Do Re Mi',

    bpm: 100,
    // 可以添加更多字段，如 order: 1 用于排序
};


const keyLibrary = ['C', '', '', '', '', '', '', '', '', '', '', ''];
const melodyLibrary = ['C4'];
const questionList: Array<string[]> = [...Array.from({ length: 5 }, () => []),]


interface DailyTrial {
    question: number;
    answer: number;
    success: number;
}


const Page = () => {
    const fire = useConfetti();
    const navigate = useNavigate();

    const settingModal = useDisclosure();
    const docModal = useDisclosure({ defaultOpen: true });


    const [record, setRecord] = useState<DailyTrial>({ question: 0, answer: 0, success: 0 })
    const [successRate, setSuccessRate] = useState<number>(0);

    const earRef = useRef<EarTrainingRef>(null);

    const initialSteps: Step[] = [
        {
            target: '#modal_ready',
            content: '先调好音量，保证能够听到声音哦~',
            placement: 'top',
            hideBackButton: true,
            disableBeacon: true,
            spotlightClicks: true,
            hideFooter: true,
        },
        {
            target: 'body',
            content: (<div>
                <p>仔细听题。</p>
                <p>唱出来会记的更快哦。</p>
            </div>),
            placement: 'center',
            hideBackButton: true,
            disableBeacon: true,
            spotlightClicks: true,
            locale: {
                next: "去答题",
                close: "去答题"
            }
        },

        {
            title: '跟唱：Do',
            content: (<>
                <p>这次我们用唱名法</p>
                <p>唱：Do，然后点击作答</p>
            </>),
            target: '#btn_key_0',
            hideBackButton: true,
            disableBeacon: true,
            spotlightClicks: true,
            hideFooter: true,
            data: "key1"
        },
        {
            title: '提交答案',
            content: "提交看看结果",
            target: '#btn_sureAnswer',
            placement: 'bottom',
            hideBackButton: true,
            disableBeacon: true,
            spotlightClicks: true,
            hideFooter: true,
        },
        {
            title: '跟唱：C',
            content: (<>
                <p>这次我们唱音名</p>
                <p>唱：C，然后点击作答</p>
            </>),
            target: '#btn_key_0',
            hideBackButton: true,
            disableBeacon: true,
            spotlightClicks: true,
            hideFooter: true,
            data: "key1"
        },

        {
            title: '提交答案',
            content: "提交看看结果",
            target: '#btn_sureAnswer',
            placement: 'bottom',
            hideFooter: true,
        },
        {
            title: '跟唱：1',
            content: (<>
                <p>这次我们直接唱数字</p>
                <p>唱：1，然后点击作答</p>
            </>),
            target: '#btn_key_0',
            hideBackButton: true,
            disableBeacon: true,
            spotlightClicks: true,
            hideFooter: true,
            data: "key1"
        },


        {
            title: '提交答案',
            content: "提交看看结果",
            target: '#btn_sureAnswer',
            placement: 'bottom',
            hideFooter: true,
        },

        {
            title: '🎉太棒了！你全都学会了🎉',
            content: "跟随小红点看看其他功能吧",
            placement: 'center',
            target: 'body',
        },
    ];

    const [state, setState] = useState({
        run: true,
        stepIndex: 0,
        steps: initialSteps,
    });



    useEffect(() => {
        //同步存储
        setRecord({ ...record, })

        let rate = 0;
        if (record.question > 0) {
            rate = (record.success / record.question) * 100;
        }

        setSuccessRate(rate);
    }, [record.success, record.question]);

    useEffect(() => {
        earRef.current?.reset()
    }, []);


    const onAnswer = ({ correct, question, answer }: { correct: boolean; question: string[]; answer: string[] }) => {
        console.debug("onAnswer", correct, question, answer)

        record.answer++;
        setRecord({ ...record })

        if (correct) {
            record.success++
            setRecord({ ...record })
            earRef.current?.newQuestion();
        }

        if (state.run) {
            state.stepIndex++;
            requestAnimationFrame(() => {
                setState({ ...state, });
            });
        }

        if (record.answer >= questionList.length) {
            let key = addToast({
                title: "答题完成,正在同步得分",
                color: "default",
                promise: new Promise(resolve => setTimeout(() => resolve(false), 3000))
            })

            const json = {
                ...meta,
                score: String(record.success * 100 / questionList.length),
            };

            console.debug("答题完成", json)

            fetch(`/x/Music/UnitScore/New`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json),
            })
                .then(resp => resp.json())
                .then(() => {
                    closeToast(key ?? "");
                    addToast({
                        title: "得分同步完成",
                        color: "success",
                    })

                    fire(); // 使用默认配置

                    let location = useLocation()
                    console.log(location)

                    const segments = location.pathname.split('/').filter(Boolean); // ["aaa", "1"]

                    // 去掉最后一层
                    const parentPath = '/' + segments.slice(0, -1).join('/');
                    navigate(parentPath, { replace: true });

                })
        }
    }

    const onNewQuestion = (index: number, question: string[]) => {

        console.debug("onNewQuestion", question)

        record.question++
        setRecord({ ...record })

        if (index >= questionList.length) {
            return;
        }


        if (state.run) {
            state.stepIndex++;
            requestAnimationFrame(() => {
                setState({ ...state, });
            });
        }


        fetch("/done", { method: "POST" })
    }

    const onPressKeyNote = (_note: string) => {

        if (state.run) {
            state.stepIndex++;
            requestAnimationFrame(() => {
                setState({ ...state, });
            });
        }
    }


    const startTrial = (_tutorial: boolean = false) => {
        fetch("/todayFirst")
            .then(res => res.json() as Promise<{ count: number }>)
            .then((_data) => {
                // record.used = data.count;

                docModal.onClose()

                setTimeout(() => {
                    requestAnimationFrame(() => {
                        setState({ ...state, run: true, stepIndex: 0 })
                    })
                }, 400)
            })
    }


    const playMelody = async (melody: string[]) => {

        await Tone.start();  // 必须放在用户手势中触发

        const synth = new Tone.PolySynth().toDestination()

        Tone.getTransport().cancel();  // 清除所有预定的事件

        const part = new Tone.Part((time, note) => {
            synth.triggerAttackRelease(note, '4n', time);
        }, melody.map((note, index) => [`0:${index}`, note]));

        part.start();

        //拍数
        Tone.getTransport().timeSignature = [melody.length, 4];
        //速度
        Tone.getTransport().bpm.value = meta.bpm;
        Tone.getTransport().start();


    };


    const handleJoyrideCallback = (data: CallBackProps) => {
        const { action, index, status, type } = data;
        // console.debug(data)

        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            // Need to set our running state to false, so we can restart if we click start again.
            setState({ ...state, run: false, stepIndex: 0 });

        } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as Events[]).includes(type)) {
            const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

            // state.stepIndex = nextStepIndex;
            requestAnimationFrame(() => {
                setState({ ...state, stepIndex: nextStepIndex, });
            });

        }

        // console.debug(type === EVENTS.TOUR_STATUS ? `${type}:${status}` : type, data);
    }

    return (
        <>
            <section className="h-full flex flex-col items-center ">
                <Joyride
                    steps={state.steps}
                    stepIndex={state.stepIndex}
                    run={state.run}
                    // continuous={true}
                    disableOverlayClose={true}
                    hideCloseButton={true}
                    showProgress={true}
                    spotlightClicks={true}
                    spotlightPadding={4}
                    locale={{
                        back: '上一步',
                        close: '好的',
                        last: '完成',
                        next: '下一步',
                        skip: '跳过',
                        nextLabelWithProgress: '下一步 ( {step} / {steps} )',
                    }}
                    callback={handleJoyrideCallback}
                // tooltipComponent={HeroUITooltip}
                />
                <Navbar className='w-screen'>
                    <NavbarContent justify="center">
                        <NavbarItem >
                            <div className="font-bold text-default-500 flex space-x-6 justify-center">
                                <p>{meta.title}</p>
                            </div>
                        </NavbarItem>
                    </NavbarContent>

                    <NavbarContent justify="end">
                        <NavbarItem>
                            <Button isIconOnly onPressUp={settingModal.onOpen} variant="light">
                                <Icon icon="solar:settings-bold" className='text-default-400 pointer-events-none text-2xl'></Icon>
                                {/* <Cog8ToothIcon className="self-center w-6 h-6 bg-transparent transition-opacity"></Cog8ToothIcon> */}
                            </Button>
                            <ThemeSwitch className="p-2"></ThemeSwitch>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>

                <div className="flex flex-col  w-full  px-4 pt-2 gap-y-6">
                    <Progress className='w-full py-0 col-span-full' aria-label='pp' size="md" value={record.question * 100.0 / questionList.length}></Progress>

                    <div className="font-bold text-sm text-default-400 flex space-x-1 justify-center items-center">
                        <Button className='mr-2' size='sm' onPress={() => playMelody(melodyLibrary)}>播放 C D E</Button>
                        <p>进度: {record.question} / {questionList.length}</p>
                        <p>正确总数：{record.success}</p>
                        <p>得分：{successRate.toFixed(2)}%</p>
                    </div>

                    <div>

                    </div>

                    {!docModal.isOpen &&
                        <EarTrainingPanel
                            ref={earRef}
                            refrenceNote={melodyLibrary[0] ?? "C4"}
                            noteRange={melodyLibrary ?? []}
                            melodyLength={1}
                            bpm={60}
                            customKeyNames={keyLibrary}
                            onAnswer={onAnswer}
                            onNewQuestion={onNewQuestion}
                            onPressKeyNote={onPressKeyNote}
                            questionList={questionList}
                        ></EarTrainingPanel>
                    }



                </div >


                <Modal
                    size='full'
                    backdrop="blur"
                    isOpen={docModal.isOpen}
                    isDismissable={false}
                    hideCloseButton={true}
                >
                    <ModalContent>
                        {() => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">练习须知</ModalHeader>
                                <ModalBody>
                                    <div className="text-left text-default-400 tracking-wide">
                                        <p className="">我们聚焦于练习，这里不赘述过多乐理</p>
                                        <p>C大调音阶的前三个音是： </p>
                                        <div className="pl-8">
                                            <div className="flex "> <span className="w-26" >音名：</span>  <Chip size="sm" className="bg-green-500/75"> C  D  E </Chip></div>
                                            <div className="flex "> <span className="w-26">简谱：</span> <Chip size="sm" className="bg-green-500/75"> 1  3  5 </Chip> </div>
                                            <div className="flex "> <span className="w-26">首调唱名：</span> <Chip size="sm" className="bg-green-500/75"> Do Mi So </Chip> </div>
                                        </div>
                                        <p>练习提示：</p>
                                        <p>用你习惯的方式唱出来！唱“C D E”、 “Do Re Mi” 或 “1 2 3”都可以，关键是<span className="font-bold"> 把音唱准，不用纠结首调或固定调</span>。</p>
                                        <p>你肯定会有疑惑！多练习几次，当你能听出任意旋律的音高时，一切就会豁然开朗！</p>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button onPress={() => startTrial()}>开始</Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>


            </section>
        </ >
    );
}

export default Page;


