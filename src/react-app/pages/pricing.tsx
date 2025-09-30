import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { useState } from "react";

export default function DocsPage() {

    const [record, setRecord] = useState<any[]>([])

    return (
        <DefaultLayout>
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className={title()}>Pricing</h1>
                    <div className="border-1 rounded shadow">


                        <Button onPressUp={() => {
                            fetch("/record")
                                .then((res) => res.json() as Promise<any[]>)
                                .then((data) => setRecord(data))
                        }}> 刷新数据</Button>

                        {record.map((item, index) => (
                            <div className="flex">
                                <div>{index}</div>
                                <div>{item}</div>
                            </div>
                        ))}

                    </div>

                    <div className="border-1 rounded shadow">

                        <Button onPressUp={() => {
                            fetch("/done", { method: "POST" })
                                .then(res => res.json())
                                .then((res) => res.json() as Promise<{ count: string }>)
                                .then((data) => alert(data.count));
                        }}> 提交</Button>
                    </div>


                </div>
            </section >
        </DefaultLayout >
    );
}
