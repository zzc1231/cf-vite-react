"use client";

import React from "react";
import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link } from "@heroui/link";
import { Checkbox } from "@heroui/checkbox";
import { addToast } from "@heroui/toast";
import { useLocalStorage } from "@/utils/localStorage";

import { useNavigate } from 'react-router-dom'


export default function Component() {
    const [isVisible, setIsVisible] = React.useState(false);
    const [, setToken] = useLocalStorage<string | undefined>("token", "")

    const navigate = useNavigate()
    const toggleVisibility = () => setIsVisible(!isVisible);



    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();


        const data = Object.fromEntries(new FormData(event.currentTarget));
        const json = { ...data, remember: !!data.remember };
        console.log(json)
        fetch("/x/Admin/User/Login", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json),
        })
            .then(resp => resp.json())
            .then(body => {
                if (body?.data?.token) {
                    setToken(body?.data?.token)
                    addToast({ title: "登录成功", color: "success" })
                    navigate('/config', { replace: true }) // 替换当前 history
                    return;
                }

                addToast({ title: "登录失败", description: body.message, color: "danger" })
            });

        console.log("handleSubmit");
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="rounded-large flex w-full max-w-sm flex-col gap-4 px-8 pt-6 pb-10">
                <p className="pb-4 text-left text-3xl font-semibold">
                    Log In
                    <span aria-label="emoji" className="ml-2" role="img">
                        👋
                    </span>
                </p>
                <Form className="flex flex-col gap-4" validationBehavior="native" onSubmit={handleSubmit}>
                    <Input
                        isRequired
                        label="用户名"
                        labelPlacement="outside"
                        name="username"
                        placeholder="输入账号"
                        type="text"
                        variant="bordered"
                    />
                    <Input
                        isRequired
                        endContent={
                            <button type="button" onClick={toggleVisibility}>
                                {isVisible ? (
                                    <EyeSlashIcon
                                        width={22}
                                        className="text-default-400 pointer-events-none text-2xl"
                                    />
                                ) : (
                                    <EyeIcon
                                        width={22}
                                        className="text-default-400 pointer-events-none text-2xl"
                                    />
                                )}
                            </button>
                        }
                        label="密码"
                        labelPlacement="outside"
                        name="password"
                        placeholder="输入密码"
                        type={isVisible ? "text" : "password"}
                        variant="bordered"
                    />
                    <div className="flex w-full items-center justify-between px-1 py-2">
                        <Checkbox defaultSelected name="remember" size="sm" value={"true"}>
                            记住我
                        </Checkbox>
                        <Link className="text-default-500" href="#" size="sm">
                            Forgot password?
                        </Link>
                    </div>
                    <Button className="w-full" color="primary" type="submit">
                        登录
                    </Button>
                </Form>
                <p className="text-small text-center">
                    <Link href="/trial" size="sm">
                        试用
                    </Link>
                </p>
            </div>
        </div>
    );
}
