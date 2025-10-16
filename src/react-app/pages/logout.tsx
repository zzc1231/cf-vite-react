// src/components/ProtectedRoute.tsx
import React, { useEffect, useState, } from 'react'
import { Navigate } from 'react-router-dom'

import { getStorageValue, useLocalStorage } from "@/utils/localStorage";

import { Spinner } from "@heroui/spinner";


const loading = (
    <div className="flex items-center justify-center h-screen w-screen flex-col">
        <Spinner classNames={{ label: "text-foreground mt-4" }} label="加载中" size='lg' variant="wave" />
    </div>
)


const ProtectedRoute: React.FC = () => {
    const [complete, setComplete] = useState<boolean>(false)
    const [, , clearToken] = useLocalStorage<string | undefined>("token", "")

    // 模拟异步获取用户身份，可替换成真实 API
    async function fetchUserStatus(): Promise<boolean> {
        return new Promise(resolve => {
            const token = getStorageValue<string>("token", "")
            fetch("/x/Admin/User/Logout",
                {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": token
                    },
                })
                .then(resp => resp.json())
                .then(body => {
                    if (body.code == 0) {
                        clearToken()
                        resolve(true)
                    }

                })
        })
    }

    useEffect(() => {
        fetchUserStatus().then(status => setComplete(status))
    }, [])

    if (complete) return <Navigate to="/login" replace />

    return <>{loading}</>
}

export default ProtectedRoute
