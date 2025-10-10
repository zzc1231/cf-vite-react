
import { Hono } from "hono";
import { proxy } from "hono/proxy";

export const proxyRoute = new Hono();



// proxyRoute.all("/*", async (c) => {
//     try {
//         const url = new URL(c.req.url);
//         const target = `https://h-7100.z2c.shop${url.pathname.replace("/x/", "/")}${url.search}`;

//         const reqInit: RequestInit = {
//             method: c.req.method,
//             headers: c.req.raw.headers,
//             body: ["GET", "HEAD"].includes(c.req.method) ? undefined : await c.req.raw.clone().arrayBuffer(),
//         };

//         const resp = await fetch(target, reqInit);

//         // 将远程响应“原封不动”转发回来
//         return new Response(resp.body, {
//             status: resp.status,
//             headers: resp.headers,
//         });
//     }
//     catch (err) {
//         console.error(err);
//         return c.text("Worker execution error", 500);
//     }
// });



proxyRoute.all('/*', (c) => {
    let originServer = 'https://h-7100.z2c.shop';

    const url = new URL(c.req.url);
    console.log("url", url)
    return proxy(
        `${originServer}${url.pathname.replace("/x/", "/")}${url.search}`,
        {
            ...c.req, // optional, specify only when forwarding all the request data (including credentials) is necessary.
            headers: {
                ...c.req.header(),
                'X-Forwarded-For': '127.0.0.1',
                'X-Forwarded-Host': c.req.header('host'),
                // Authorization: undefined, // do not propagate request headers contained in c.req.header('Authorization')
            },
        })
})