// src/components/ProtectedRoute.tsx
import React, { useEffect, useState, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { getStorageValue } from "@/utils/localStorage";

import { Spinner } from "@heroui/spinner";

export type UserStatus = 'trial' | 'normal' | 'admin' | null

interface ProtectedRouteProps {
    children: ReactNode
    allowedStatuses?: UserStatus[] // 可指定允许访问的身份类型
    fallbackPath?: string          // 不允许访问时跳转的路径
    loadingElement?: ReactNode     // 等待身份获取时显示的内容
}


const loading = (
    <div className="flex items-center justify-center h-screen w-screen flex-col">
        <Spinner classNames={{ label: "text-foreground mt-4" }} label="加载中" size='lg' variant="wave" />
    </div>
)


const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedStatuses = ['normal', 'admin'],
    fallbackPath = '/trial',
    loadingElement = loading,
}) => {
    const [userStatus, setUserStatus] = useState<UserStatus | undefined>(undefined)


    // 模拟异步获取用户身份，可替换成真实 API
    async function fetchUserStatus(): Promise<UserStatus> {
        return new Promise(resolve => {
            const token = getStorageValue<string>("token", "")
            fetch("/x/Admin/User/Info",
                {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": token
                    },
                })
                .then(resp => resp.json())
                .then(body => {
                    if (body.code == 0)
                        resolve("normal")

                    if (body.code == 401)
                        resolve("trial")
                })
        })
    }

    useEffect(() => {
        fetchUserStatus().then(status => setUserStatus(status))
    }, [])

    if (userStatus === undefined) return <>{loadingElement}</> // 等待身份判断

    // 判断是否允许访问
    if (!allowedStatuses.includes(userStatus)) return <Navigate to={fallbackPath} replace />

    return <>{children}</>
}

export default ProtectedRoute
