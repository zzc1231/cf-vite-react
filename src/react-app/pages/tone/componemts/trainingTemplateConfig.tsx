'use client';

import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from '@heroui/button';
import { Select, SelectItem } from "@heroui/select";
import { useState } from "react";
import { Spacer } from "@heroui/spacer";
import { Input } from "@heroui/input";
import { getDefaultNoteRange } from "@/utils/pitchCompare";
import { SharedSelection } from "@heroui/system";
import { Snippet } from "@heroui/snippet";

export interface TrainingTemplateConfigProps {
    /**
     * 模版名称： C大调 C Major
     */
    templateName?: string;
    /** 自定义键盘按键名称（选传，不传则默认12平均律） */
    customKeyNames?: string[];

    /** 自定义键盘按键名称（选传，不传则默认12平均律） */
    customKeyNotes?: string[];

    /** 回调事件：回答提交时触发 */
    onConfigChange?: (data: TrainingTemplateConfigProps) => void;
}

const Page = (props: TrainingTemplateConfigProps,) => {

    const btnNameLib = ['C', 'C# _ Db', 'D', 'D# _ Eb', 'E', 'F', 'F# _ Gb', 'G', 'G# _ Ab', 'A', 'A# _ Bb', 'B']
    const noteLib = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4']


    const [customKeyNames, setCustomKeyNames] = useState(props.customKeyNames || btnNameLib);
    const [customKeyNotes, setCustomKeyNotes] = useState(props.customKeyNotes || noteLib);
    const [templateName] = useState(props.templateName || "新模板");

    const noteRange = getDefaultNoteRange()
    // debug: ensure noteRange has values
    console.debug('getDefaultNoteRange -> length:', noteRange.length, 'sample:', noteRange.slice(0, 6))


    const onKeyNoteChange = (note: SharedSelection, index: number) => {
        if (!note.currentKey)
            return;

        const newArr = [...customKeyNotes];
        newArr[index] = note.currentKey;
        setCustomKeyNotes(newArr);

        props.onConfigChange?.({
            ...props,
            customKeyNotes: newArr
        });

        console.log(note, index);
    }

    const onKeyNameChange = (newName: string, index: number) => {
        const newArr = [...customKeyNames];
        newArr[index] = newName;
        setCustomKeyNames(newArr);

        props.onConfigChange?.({
            ...props,
            customKeyNames: newArr
        });

        console.log(newName, index);
    }



    return (
        <section className="h-full w-full flex flex-col items-center  gap-4">
            <div className=" space-y-2  justify-center  w-full xl:min-w-[50%] ">

                <div className="overflow-x-auto grid grid-flow-col auto-cols-auto gap-1 items-center "></div>
                <Input value={templateName} label="名称" />
                {/* <Select
                    isRequired

                    className="max-w-xs"
                    label="音名"
                    placeholder="请选择音名"
                    // selectedKeys={[customKeyNotes[0]]}
                    onSelectionChange={(keys) => onKeyNoteChange(keys, 0)}
                >
                    {noteRange.map((note) => (<SelectItem key={note} textValue={note}>{note}</SelectItem>))}
                </Select> */}
                <Spacer y={4}></Spacer>

                <div className="grid grid-cols-3 gap-y-1 gap-x-1 items-stretch">
                    {customKeyNames.map((keyName, index) => (
                        <Popover key={index} showArrow offset={10} placement="bottom" backdrop="blur">
                            <PopoverTrigger>
                                <Button className="h-15 text-lg
                                 flex items-center justify-center">
                                    {keyName}
                                    <Snippet
                                        size="sm"
                                        radius="lg"
                                        className=" absolute bottom-1 right-1 "
                                        hideCopyButton
                                        hideSymbol
                                        color="secondary"
                                    >
                                        {customKeyNotes[index]}
                                    </Snippet>
                                </Button>

                            </PopoverTrigger>
                            <PopoverContent className="w-[240px]">

                                <div className="px-1 py-2 w-full">
                                    <p className="text-small font-bold text-foreground">
                                        按键配置
                                    </p>
                                    <div className="mt-2 flex flex-col gap-2 w-full">
                                        <Input value={keyName} label="键名" onValueChange={val => onKeyNameChange(val, index)} />
                                        <Input value={customKeyNotes[index]} label="音名" />
                                        <Select
                                            items={noteRange.map(note => ({ key: note, label: note }))}
                                            className="max-w-xs"
                                            label="音名"
                                            placeholder="请选择音名"
                                            selectedKeys={[customKeyNotes[index]]}
                                            onSelectionChange={(keys) => onKeyNoteChange(keys, index)}
                                        >
                                            {(note) => <SelectItem key={note.key} >{note.label}</SelectItem>}
                                        </Select>
                                    </div>
                                </div>

                            </PopoverContent>
                        </Popover>

                    ))}
                </div>

                {/* <NumberInput
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
                <Button size="lg" onPaste={clearScore} > 重置得分 </Button> */}

            </div>
        </section>
    );
}

export default Page;
