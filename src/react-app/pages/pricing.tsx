import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { useState } from "react";

export default function DocsPage() {

    const [record, setRecord] = useState<any[]>([])

    return (
        <DefaultLayout>
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 >Pricing</h1>
                    <div className="border-1 rounded shadow">
                        <Button onPressUp={() => {
                            fetch("/record")
                                .then((res) => res.json() as Promise<any[]>)
                                .then((data) => setRecord(data))
                        }}> 刷新数据</Button>

                        {record.map((item, index) => (
                            <div className="flex">
                                <div>{index}</div>
                                <div> id:{item.id}</div>
                                <div> create_at:{item.create_at}</div>
                                <div> date:{item.date}</div>
                                <div> ip:{item.ip}</div>
                            </div>
                        ))}
                    </div>

                    <div className="border-1 rounded shadow">

                        <Button onPressUp={() => {
                            fetch("/done", { method: "POST" })

                                .then((res) => alert(res.ok))
                        }}> 提交</Button>

                        <Button onPressUp={() => {
                            fetch("/todayFirst")
                                .then(res => res.json() as Promise<{ count: string }>)
                                .then((data) => alert("count: " + data.count))
                        }}> 查询今日次数</Button>
                    </div>


                </div>
            </section >
        </DefaultLayout >
    );
}
