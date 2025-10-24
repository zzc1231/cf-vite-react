import { Button } from "@heroui/button";
import { Card, CardFooter, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { forwardRef, useState } from "react";
import { Unit } from "tone";


export interface Unit {
    title: string,
    desc: string,
    tags?: string[]
}

export interface CourseItemProps {
    title: string,
    desc: string,
    tags?: React.ReactNode[]
}


const CourseItem = forwardRef<HTMLDivElement, CourseItemProps>(
    (props: CourseItemProps, ref) => {
        const [unitList] = useState<Unit[]>([
            { title: "认识", desc: "tags" },
            { title: "title", desc: "tags" },
            { title: "title", desc: "tags" },
            { title: "title", desc: "tags" },
            { title: "title", desc: "tags" },
        ])


        return (
            <div ref={ref} className="course-item">
                <Navbar>
                    <NavbarContent justify="center">
                        <NavbarItem >
                            <Card>
                                <div className="flex-col items-start">
                                    <p className=" uppercase font-bold">{props.title || "title"}</p>
                                    <h4 className=" font-medium text-2xl">{props.desc || "desc"}</h4>
                                </div>
                            </Card>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>



                <div className="flex flex-col gap-2 px-4 pt-6">
                    {unitList.map((item, index) => (
                        <Card key={index} isFooterBlurred className="w-full h-[150px] col-span-12 sm:col-span-5" >
                            <CardHeader className="absolute z-10 top-1 flex-col items-start">
                                <b>{item.title}</b>
                                <p className="text-default-500">{item.desc}</p>

                            </CardHeader>
                            <Image
                                removeWrapper
                                alt="Card example background"
                                className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
                                src="https://heroui.com/images/card-example-6.jpeg"
                            />
                            <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
                                <div>
                                    <p className=" text-tiny">Available soon.</p>
                                    <p className=" text-tiny">Get notified.</p>
                                </div>
                                <Button className="text-tiny" color="primary" radius="full" size="sm">
                                    Notify Me
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



