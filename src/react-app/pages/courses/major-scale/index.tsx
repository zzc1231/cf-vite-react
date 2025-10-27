import { Button } from "@heroui/button";
import { Card, CardFooter, CardHeader } from "@heroui/card";
// import { Image } from "@heroui/image";
import { Link } from "@heroui/link";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { cn } from "@heroui/theme";
import { Icon } from "@iconify/react";
import { forwardRef, useState } from "react";

export interface UnitMeta {
    fileName?: string,
    title: string,
    desc: string,
    tags?: string[]
}

export interface CourseMeta {
    title: string,
    desc: string,
    tags?: React.ReactNode[]
}




export const meta: CourseMeta = {
    title: 'C 大调音阶',
    desc: 'C 大调音阶听辨',
    // 可以添加更多字段，如 order: 1 用于排序
};

const getCourseId = () => {
    // 获取当前模块的 URL
    const currentUrl = new URL(import.meta.url);

    // 获取路径部分（pathname）
    const currentPath = currentUrl.pathname;

    // 分割路径并提取父目录名称（倒数第二个部分）
    const pathParts = currentPath.split('/').filter(part => part !== '');
    const parentDirName = pathParts[pathParts.length - 2] || '/'; // 如果无父目录，返回根

    return parentDirName;
}


// 新增/更新：导出 unit 列表，提取 meta 数据
const getUnitList = () => {
    const unitModulesEager = import.meta.glob('./units/*.tsx', { eager: true });
    return Object.entries(unitModulesEager).map(([path, module]) => {
        const fileName = path.split('/').pop()?.replace('.tsx', '') || '';
        console.debug(path)
        let meta = ((module as any).meta || { title: fileName, description: 'No description available.' }) as UnitMeta;  // 默认值如果无 meta
        meta.fileName = fileName;
        return meta;

    }).sort((a, b) => (a.fileName || '').localeCompare(b.fileName || ''));  // 可选：按标题排序
};


const CourseItem = forwardRef<HTMLDivElement, {}>(
    (_props, ref) => {

        const [courseId] = useState<string>(getCourseId())
        const [unitList] = useState<UnitMeta[]>(getUnitList())


        const score = [90, 20, 50, 60, 70]


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

                <div className="flex flex-col gap-2 px-4 pt-6">
                    {unitList.map((item, index) => (
                        <Card key={index} isFooterBlurred className="w-full h-[150px] col-span-12 sm:col-span-5 bg-linear-to  bg-linear-to-br from-emerald-400/90 to-sky-400/90" >
                            <CardHeader className="absolute z-10 top-1 flex-col items-start">
                                <h1 className="text-large font-medium mt-2">{item.title}</h1>
                                <p className="text-small text-foreground/80">{item.desc}</p>
                            </CardHeader>
                            {/* <Image
                                removeWrapper
                                alt="Card example background"
                                className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
                                src="https://heroui.com/images/card-example-6.jpeg"
                            /> */}
                            <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%-8px)] shadow-small ml-1 z-10">

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
                                    href={`courses/${courseId}/${item.fileName}`}
                                    variant="solid"
                                >
                                    开始练习
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

            </div>
        );
    }
);

export default CourseItem;



