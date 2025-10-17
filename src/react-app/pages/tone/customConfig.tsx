'use client';

import TrainingTemplateConfig, { TrainingTemplateConfigProps } from "./componemts/trainingTemplateConfig";
import Layout from "@/layouts/default";
import { addToast, closeToast } from "@heroui/toast";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Spacer } from "@heroui/spacer";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";

const Page = () => {
    const [config, setConfig] = useState<TrainingTemplateConfigProps>({})
    const [originParam, setOriginParam] = useState<any>({
        "category": "ear",
        "name": "string",
        "longValue": "{}",
        "userID": 1
    })

    const onConfigChange = (data: TrainingTemplateConfigProps) => {
        console.debug(data)
        // addToast({
        //     title: undefined,
        //     description: JSON.stringify(data),
        //     hideIcon: true,
        //     timeout: 3000,
        //     closeIcon: (<XMarkIcon width={24} widths={24} />)
        // })
        setConfig(data)
    }

    useEffect(() => {
        const fetchData = async () => {
            var json = {
                username: "admin",
                password: "admin",
                remember: true
            };

            await fetch("/x/Admin/User/Login", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json),
            });

            fetch("/x/Admin/Parameter?userId=1&category=ear")
                .then(resp => resp.json())
                .then(body => {
                    if (body.code == 401) {

                    }

                    if (body.data?.length <= 0)
                        return;

                    if (!body.data[0].longValue)
                        return

                    setOriginParam(body.data[0])
                    let con = JSON.parse(body.data[0].longValue) as TrainingTemplateConfigProps
                    console.debug("data", con)
                    setConfig(con)
                })
        };
        fetchData();
    }, [])

    const handleSave = () => {
        let key = addToast({
            title: "正在提交",
            promise: new Promise(() => {
                let json = {
                    ...originParam,
                    "longValue": JSON.stringify(config),
                }

                fetch("/x/Admin/Parameter?userId=1&category=ear", {
                    method: originParam.id ? "PUT" : "POST",
                    headers: {
                        'Content-Type': 'application/json',  // 告诉服务器发送 JSON
                    },
                    body: JSON.stringify(json),
                }).then(() => {
                    closeToast(key ?? "")
                    addToast({
                        icon: (<CheckCircleIcon className="text-green-400" />),
                        color: "success",
                        title: "提交成功",
                    })
                })
            }),
        });


    }


    return (
        <Layout>
            <section className="h-full flex flex-col items-center  gap-4">
                <div className=" space-y-2  justify-center w-full  px-4 pt-2">
                    <TrainingTemplateConfig onConfigChange={onConfigChange}
                        templateName={config.templateName}
                        customKeyNames={config.customKeyNames}
                        customKeyNotes={config.customKeyNotes}
                        customKeyEnable={config.customKeyEnable}
                    />
                    <Spacer y={4}></Spacer>
                    <Button className="w-full" onPress={handleSave}> Save</Button>
                </div >
            </section>
        </Layout>
    );
}

export default Page;
