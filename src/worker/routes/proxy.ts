
import { Hono } from "hono";

export const proxyRoute = new Hono();



proxyRoute.all("/*", async (c) => {
    try {
        const url = new URL(c.req.url);
        const target = `https://h-7100.z2c.shop${url.pathname.replace("/x/", "/")}`;

        const reqInit: RequestInit = {
            method: c.req.method,
            headers: c.req.raw.headers,
            body: ["GET", "HEAD"].includes(c.req.method) ? undefined : await c.req.raw.clone().arrayBuffer(),
        };

        const resp = await fetch(target, reqInit);

        // 将远程响应“原封不动”转发回来
        return new Response(resp.body, {
            status: resp.status,
            headers: resp.headers,
        });
    }
    catch (err) {
        console.error(err);
        return c.text("Worker execution error", 500);
    }
});