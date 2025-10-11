'use client';

import TrainingTemplateConfig from "./componemts/trainingTemplateConfig";
import Layout from "@/layouts/default";

const Page = () => {

    return (
        <Layout>
            <section className="h-full flex flex-col items-center  gap-4">
                <div className=" space-y-2  justify-center w-full  px-4 pt-2">
                    <TrainingTemplateConfig />
                </div >
            </section>
        </Layout>
    );
}

export default Page;
