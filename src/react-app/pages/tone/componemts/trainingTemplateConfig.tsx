'use client';

import { Button } from '@heroui/button';
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState } from "react";
import { Spacer } from "@heroui/spacer";
import { Input } from "@heroui/input";
import { getDefaultNoteRange } from "@/utils/pitchCompare";
import { Chip } from "@heroui/chip";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";

import { SpeakerWaveIcon } from "@heroicons/react/24/solid";
import { Checkbox } from '@heroui/checkbox';

export interface TrainingTemplateConfigProps {
    /**
     * 模版名称： C大调 C Major
     */
    templateName?: string;

    /** 自定义键盘按键名称（选传，不传则默认12平均律） */
    customKeyEnable?: boolean[];

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

    const [customKeyEnable, setCustomKeyEnable] = useState(props.customKeyEnable || new Array(12).fill(true));
    const [customKeyNames, setCustomKeyNames] = useState(props.customKeyNames || btnNameLib);
    const [customKeyNotes, setCustomKeyNotes] = useState(props.customKeyNotes || noteLib);
    const [templateName, setTemplateName] = useState(props.templateName || "新模板");

    const [targetIndex, setTargetIndex] = useState<number>(-1)

    const noteRange = getDefaultNoteRange().map(note => ({ key: note, label: note }))
    // debug: ensure noteRange has values
    // console.debug('getDefaultNoteRange -> length:', noteRange.length, 'sample:', noteRange.slice(0, 6))


    // 当 props 改变时同步 state
    useEffect(() => {
        if (props.templateName !== undefined)
            setTemplateName(props.templateName);

        if (props.customKeyNames)
            setCustomKeyNames(props.customKeyNames);

        if (props.customKeyNotes)
            setCustomKeyNotes(props.customKeyNotes);

        if (props.customKeyEnable)
            setCustomKeyEnable(props.customKeyEnable);

    }, [props.templateName, props.customKeyNames, props.customKeyNotes, props.customKeyEnable]);

    // 统一通知父组件
    useEffect(() => {
        props.onConfigChange?.({
            templateName,
            customKeyNames,
            customKeyNotes,
            customKeyEnable
        });
    }, [templateName, customKeyNames, customKeyNotes, customKeyEnable]);

    const onKeyNoteChange = (note: string, index: number) => {
        const newArr = [...customKeyNotes];
        newArr[index] = note;
        setCustomKeyNotes(newArr);
    }

    const onKeyNameChange = (newName: string, index: number) => {
        const newArr = [...customKeyNames];
        newArr[index] = newName;
        setCustomKeyNames(newArr);
    }

    const onKeyEnableChange = (selected: boolean, index: number) => {
        const newArr = [...customKeyEnable];
        newArr[index] = selected;
        setCustomKeyEnable(newArr);
    }

    const OnTemplateNameChange = (val: string) => {
        setTemplateName(val);
    }

    return (
        <section className="h-full w-full flex flex-col items-center  gap-4">
            <div className=" space-y-2  justify-center  w-full xl:min-w-[50%] ">

                <div className="overflow-x-auto grid grid-flow-col auto-cols-auto gap-1 items-center "></div>
                <Input value={templateName} label="名称" onValueChange={OnTemplateNameChange} />
                <Spacer y={4}></Spacer>

                <div className="grid grid-cols-3 gap-y-1 gap-x-1 items-stretch">
                    {customKeyNames.map((keyName, index) => (

                        <Button key={index}
                            className="h-16 text-lg font-medium flex items-center justify-center "
                            onPress={() => setTargetIndex(index)}

                            variant={customKeyEnable[index] ? "solid" : "flat"}
                        >
                            {keyName}

                            <div className='absolute bottom-0 right-0.5 flex gap-0.5'>
                                <Chip
                                    size="sm"
                                    radius="md"
                                    className=' py-0 h-4'
                                    variant="flat"
                                    color="secondary"
                                >

                                    {customKeyNotes[index]}
                                </Chip>

                                {customKeyEnable[index] && <Chip
                                    size="sm"
                                    radius="md"
                                    className=' py-1 h-4 px-0.5'
                                    variant="flat"
                                    color="success"
                                >
                                    <SpeakerWaveIcon color='#17C964' width={12} />
                                </Chip>
                                }
                            </div>


                        </Button>


                    ))}
                </div>

                <Modal
                    backdrop="blur"
                    shouldBlockScroll={false}
                    isOpen={targetIndex >= 0}
                    // isDismissable={false}
                    onClose={() => setTargetIndex(-1)}
                >
                    <ModalContent>
                        {() => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">修改按键</ModalHeader>
                                <ModalBody>

                                    <Input size='lg'
                                        value={customKeyNames[targetIndex]}
                                        label="键名"
                                        labelPlacement="outside"
                                        onValueChange={val => onKeyNameChange(val, targetIndex)}
                                    />

                                    <Input size='lg'
                                        value={customKeyNotes[targetIndex]}
                                        label="音名"
                                        labelPlacement="outside"
                                        onValueChange={val => onKeyNoteChange(val, targetIndex)}
                                    />

                                    <Select size='lg'
                                        labelPlacement="outside"
                                        label="音名"
                                        selectionMode="single"
                                        items={noteRange}
                                        className=""
                                        placeholder="请选择音名"
                                        selectedKeys={[customKeyNotes[targetIndex]]}
                                        onSelectionChange={(keys) => keys.currentKey && onKeyNoteChange(keys.currentKey, targetIndex)}
                                    >
                                        {(note) => <SelectItem key={note.key} >{note.label}</SelectItem>}
                                    </Select>

                                    <Checkbox size='lg'
                                        isSelected={customKeyEnable[targetIndex]}
                                        onValueChange={val => onKeyEnableChange(val, targetIndex)}
                                        value={"true"}
                                    >
                                        是否启用
                                    </Checkbox>
                                    <Spacer y={4}></Spacer>
                                </ModalBody>
                                {/* <ModalFooter>
                                    <Button onPress={() => setTargetIndex(-1)}>关闭</Button>
                                </ModalFooter> */}
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </section >
    );
}

export default Page;
