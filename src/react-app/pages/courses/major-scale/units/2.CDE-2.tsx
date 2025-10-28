'use client';

import { Button } from '@heroui/button';


import { useEffect, useRef, useState } from "react";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";
import { useLocalStorage } from "@/utils/localStorage";
import { useDisclosure } from "@heroui/use-disclosure";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";

import { ThemeSwitch } from "@/components/theme-switch";
import EarTrainingPanel, { EarTrainingRef } from "../components/earTeanningPanel";
import Joyride, { ACTIONS, CallBackProps, Events, EVENTS, STATUS, Step } from "react-joyride-react-19";
import { Chip } from "@heroui/chip";
import { UnitMeta } from '..';


export const meta: UnitMeta = {
    title: 'Unit 2: C D E',
    desc: '重复 2 拍 旋律',
    // 可以添加更多字段，如 order: 1 用于排序
};


interface DailyTrial {
    used: number;
    succ: number;
}


const Page = () => {
    const settingModal = useDisclosure();
    const trailModal = useDisclosure({ defaultOpen: true });

    const dailyLimit = 30;
    const keyLibrary = ['C', '', 'D', '', 'E', '', '', '', '', '', '', ''];
    const melodyLibrary = ['C4', 'D4', 'E4'];

    const [record, setRecord] = useLocalStorage<DailyTrial>(`tone.todayTrail_${new Date().getMonth()}_${new Date().getDate()}`, { used: dailyLimit - 1, succ: 0 })
    const [successRate, setSuccessRate] = useState<number>(0);

    const earRef = useRef<EarTrainingRef>(null);

    const initialSteps: Step[] = [
        {
            content: (<div className="text-left text-default-400 tracking-wide">
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
            ),
            placement: 'center',
            target: 'body',
            title: (<p>认识 Do Re Mi</p>)
        },
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
            content: '仔细听题,然后回答问题',
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

            title: '第1个音',
            content: "选 C",
            target: '#btn_key_0',
            hideBackButton: true,
            disableBeacon: true,
            spotlightClicks: true,
            hideFooter: true,
            data: "key1"
        },
        // {
        //     title: '第2个音',
        //     content: "选 E",
        //     target: '#btn_key_4',
        //     hideBackButton: true,
        //     disableBeacon: true,
        //     spotlightClicks: true,
        //     hideFooter: true,
        // },
        // {
        //     title: '第3个音',
        //     content: "选 G",
        //     target: '#btn_key_7',
        //     hideBackButton: true,
        //     disableBeacon: true,
        //     spotlightClicks: true,
        //     hideFooter: true,
        // },
        // {
        //     title: '第4个音',
        //     content: "选 B",
        //     target: '#btn_key_11',
        //     hideBackButton: true,
        //     disableBeacon: true,
        //     spotlightClicks: true,
        //     hideFooter: true,
        // },
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
            title: '答案区',
            content: "在这里对比一下,找出答错的音",
            target: '#div_anwserPanel',
            placement: 'top',
            hideBackButton: true,
            disableBeacon: true,
        },

        {
            title: '🎉太棒了！你全都学会了🎉',
            content: "跟随小红点看看其他功能的介绍吧",
            placement: 'center',
            target: 'body',
        },

        {
            title: '播放参考音',
            content: "忘了音高？点这里",
            placement: 'top',
            target: '#btn_playRefrence',
            hideBackButton: true,
        },
        {
            title: '重放题目',
            content: "没听清就再放一次",
            placement: 'top',
            target: '#btn_replay',
        },
        {
            title: '清除答案',
            content: "不小心按错也可以重来",
            placement: 'top',
            target: '#btn_clearAnswer',
        },
        {
            title: '下一题',
            content: "这题答错不要紧，重要的是下一题！",
            placement: 'top',
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
        run: false,
        stepIndex: 0,
        steps: initialSteps,
    });


    useEffect(() => {

    }, [])

    useEffect(() => {
        //同步存储
        setRecord({ ...record, })

        if (record.used >= dailyLimit) {
            settingModal.onClose()
            trailModal.onClose()
        }

        let rate = 0;
        if (record.used > 0) {
            rate = (record.succ / record.used) * 100;
        }

        setSuccessRate(rate);
    }, [record.used, record.succ]);

    useEffect(() => {

        earRef.current?.reset()

    }, []);


    const onAnswer = ({ correct, question, answer }: { correct: boolean; question: string[]; answer: string[] }) => {
        console.debug("onAnswer", correct, question, answer)

        if (correct) {
            record.succ++
            earRef.current?.newQuestion();
        }

        if (state.run) {
            let starIndex = state.steps.findIndex(item => item.target == '#div_anwserPanel');
            if (starIndex >= state.stepIndex) {
                if (correct) {
                    state.steps[starIndex].content = "答错正确会自动进入下一题，当答题错误时可以在这里比对"
                }

                requestAnimationFrame(() => {
                    setState({ ...state, stepIndex: starIndex, });
                });
            }
        }
    }

    const onNewQuestion = (_index: number, question: string[]) => {
        let starIndex = state.steps.findIndex(item => item.data == "key1");


        console.debug("onNewQuestion", starIndex)

        if (state.stepIndex <= starIndex) {
            let step = state.steps[starIndex];

            step.content = `选 ${question[0].replace(/\d+$/, '')}`

            requestAnimationFrame(() => {
                setState({ ...state, stepIndex: starIndex, });
            });
        }
        record.used++

        fetch("/done", { method: "POST" })
    }

    const onPressKeyNote = (_note: string) => {
        let starIndex = state.steps.findIndex(item => item.target == '#btn_key_0');

        let endIndex = state.steps.findIndex(item => item.target == '#btn_sureAnswer');

        if (starIndex <= state.stepIndex
            && state.stepIndex < endIndex
            && state.run
        ) {
            requestAnimationFrame(() => {
                setState({ ...state, run: true, stepIndex: starIndex + 1, });
            });
        }
    }


    // const startTrial = (tutorial: boolean = false) => {
    //     fetch("/todayFirst")
    //         .then(res => res.json() as Promise<{ count: number }>)
    //         .then((data) => {
    //             record.used = data.count;

    //             trailModal.onClose()

    //             if (tutorial || data.count == 0) {

    //                 requestAnimationFrame(() => {
    //                     setState({ ...state, run: true })
    //                 })
    //             }
    //         })
    // }


    const handleJoyrideCallback = (data: CallBackProps) => {
        const { action, index, status, type } = data;
        console.debug(data)

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

        console.debug(type === EVENTS.TOUR_STATUS ? `${type}:${status}` : type, data);
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
                <Navbar>
                    <NavbarContent justify="center">
                        <NavbarItem >
                            <div className="font-bold text-default-500 flex space-x-6 justify-center">
                                <p>config.scaleName</p>
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
                                <Cog8ToothIcon className="self-center w-6 h-6 bg-transparent transition-opacity"></Cog8ToothIcon>
                            </Button>
                            <ThemeSwitch className="p-2"></ThemeSwitch>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>
                <div className="flex flex-col  w-full  px-4 pt-2 gap-y-6">

                    <EarTrainingPanel
                        ref={earRef}
                        refrenceNote={melodyLibrary[0] ?? "C4"}
                        noteRange={melodyLibrary ?? []}
                        melodyLength={2}
                        bpm={60}
                        customKeyNames={keyLibrary}
                        onAnswer={onAnswer}
                        onNewQuestion={onNewQuestion}
                        onPressKeyNote={onPressKeyNote}
                        questionList={Array.from({ length: 20 })}
                    ></EarTrainingPanel>

                </div >




            </section>
        </ >
    );
}

export default Page;
