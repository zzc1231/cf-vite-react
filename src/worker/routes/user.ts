import { Hono } from "hono";

export const userRoute = new Hono();

userRoute.get("/", (c) => {
    return c.json({ message: "user list" });
});

userRoute.get("/:token", async (c) => {
    const token = c.req.param("token");

    let resp = await fetch("http://8.153.207.38:7101/Todo/Task/List", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    // 检查请求是否成功
    if (!resp.ok) {
        console.error("请求失败:", resp.status, resp.statusText);
        const errText = await resp.text();
        console.error("错误详情:", errText);
        return c.json(errText);
    } else {
        // 解析 JSON 数据
        const data = await resp.json() as unknown as Record<string, any>;
        console.log("返回数据:", data);
        return c.json(data);
    }

});
