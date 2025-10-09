import { Hono } from "hono";

export const proxyRoute = new Hono();

proxyRoute.all("/*", async (c) => {
    try {
        const url = new URL(c.req.url);
        // 你的目标地址
        const target = `http://8.153.207.38:7101${url.pathname.replace(/^\/x/, "")}${url.search}`;

        // 构造安全 Header
        const headers = new Headers();
        for (const [key, value] of c.req.raw.headers.entries()) {
            if (!["host", "cf-connecting-ip", "cf-ipcountry"].includes(key.toLowerCase())) {
                headers.set(key, value);
            }
        }

        const reqInit: RequestInit = {
            method: c.req.method,
            headers,
            body: ["GET", "HEAD"].includes(c.req.method)
                ? undefined
                : await c.req.arrayBuffer(),
        };

        const resp = await fetch(target, reqInit);

        // 过滤危险响应头
        const responseHeaders = new Headers();
        for (const [key, value] of resp.headers.entries()) {
            if (!["transfer-encoding", "connection", "content-encoding"].includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        }

        return new Response(resp.body, {
            status: resp.status,
            headers: responseHeaders,
        });
    } catch (err) {
        console.error(err);
        return c.text("Worker execution error", 500);
    }
});
