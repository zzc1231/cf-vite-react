'use client';

import { Button } from "@heroui/button";
import { Card, CardFooter, CardHeader } from "@heroui/card";
// import { Image } from "@heroui/image";
import { Link } from "@heroui/link";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { cn } from "@heroui/theme";
import { Icon } from "@iconify/react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { forwardRef, useEffect } from "react";


export interface UnitMeta {
    fileName?: string,
    title: string,
    desc: string,

    tags?: string[]
}

export interface CourseMeta {
    courseId: string,
    unitList: UnitMeta[],
    title: string,
    desc: string,
    tags?: React.ReactNode[]
}



// 新增/更新：导出 unit 列表，提取 meta 数据
const getUnitList = (): UnitMeta[] => {
    const unitModulesEager = import.meta.glob('./units/*.tsx', { eager: true });
    return Object.entries(unitModulesEager).map(([path, module]) => {
        const fileName = path.split('/').pop()?.replace('.tsx', '') || '';
        console.debug(path)
        const metaData = {
            ...((module as any).meta ?? { title: fileName, description: 'No description available.' }),
            fileName
        };
        return metaData;

    }).sort((a, b) => (a.fileName || '').localeCompare(b.fileName || ''));  // 可选：按标题排序
};

export const meta: CourseMeta = {
    courseId: "",
    unitList: getUnitList(),
    // title: 'C 大调音阶',
    // desc: 'C 大调音阶听辨',
    title: 'C title',
    desc: 'C desc',
};



const listVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12, // 柔和节奏
            delayChildren: 0.1,
        },
    },
};

// iOS 风格核心：轻缓、自然、柔和加速减速曲线
const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.9,
            ease: [0.22, 0.61, 0.36, 1], // 类似 iOS 原生缓动（Material & iOS 系统一致）
        },
    },
};


const CourseItem = forwardRef<HTMLDivElement, {}>(
    (_props, ref) => {
        const score = [90, 20, 50, 60, 70]
        const controls = useAnimation();
        const [ref1, inView] = useInView({ triggerOnce: true, threshold: 0.2 }); // 仅触发一次

        useEffect(() => {
            if (inView) {
                controls.start("visible");
            }
        }, [controls, inView]);

        return (
            <div ref={ref} className="course-item">
                <Navbar>
                    <NavbarContent justify="center">
                        <NavbarItem >
                            <div className="flex-col items-start ">
                                <h4 className=" font-medium text-2xl">{meta.title || "desc"}</h4>
                                <p className=" uppercase font-bold text-foreground/80">{meta.desc || "title"}</p>
                            </div>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>

                <div >

                    <motion.div
                        ref={ref1}
                        variants={listVariants}
                        initial="hidden"
                        animate={controls}
                        className="flex flex-col gap-3 px-4 pt-6"
                    >
                        {meta.unitList.map((item, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className=""
                            >
                                <Card isFooterBlurred className="w-full h-[150px] col-span-12 sm:col-span-5  border-sky-400 border-1  bg-linear-to-br from-emerald-400/80 to-sky-400/80 shadow-lg  rounded-l-xl"    >
                                    <CardHeader className="absolute z-10 top-1 flex-col items-start">
                                        <h1 className="text-large font-medium mt-2">{item.title}</h1>
                                        <p className="text-small text-foreground/80">{item.desc}</p>
                                    </CardHeader>

                                    <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute  rounded-xl bottom-1 w-[calc(100%-8px)] shadow-small ml-1 z-10">
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }, (_, i) => {


                                                const isSelected = i + 1 <= (score[index] / 18);

                                                return (
                                                    <Icon
                                                        key={i}
                                                        className={cn(
                                                            "text-lg sm:text-xl",
                                                            isSelected ? "text-warning" : "text-default-200",
                                                        )}
                                                        icon="solar:star-bold"
                                                    />
                                                );
                                            })}
                                            <div className={cn(
                                                "font-bold",
                                                "text-lg sm:text-xl",
                                                "text-warning",
                                            )}>{score[index]}</div>

                                        </div>

                                        <Button
                                            // showAnchorIcon
                                            as={Link}
                                            color="primary"
                                            href={`courses/${meta.courseId}/${item.fileName}`}
                                            variant="solid"
                                        >
                                            开始练习
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

            </div>
        );
    }
);

export default CourseItem;



