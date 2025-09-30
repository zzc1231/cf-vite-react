import { Hono } from "hono";

type Bindings = {
    isTodayFirst: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));


app.get("/record", async (c) => {
    const db = c.env.isTodayFirst; // Cloudflare D1 binding
    const { results } = await db.prepare(`SELECT * FROM test`).all();
    return c.json(results);
})

app.get("/todayFirst", async (c) => {
    const ip = c.req.header('CF-Connecting-IP');
    const db = c.env.isTodayFirst; // Cloudflare D1 binding
    const { results } = await db
        .prepare(`SELECT count(1) as count FROM test where ip =(?) and date=DATE('now')`)
        .bind(ip)
        .all();
    return c.json(results[0]);
})

app.post("/done", async (c) => {
    const ip = c.req.header('CF-Connecting-IP');
    const db = c.env.isTodayFirst; // Cloudflare D1 binding
    const { results } = await db
        .prepare(`INSERT INTO  test (ip,date) VALUES (?,?)`)
        .bind(ip, new Date().toISOString().split('T')[0])
        .run();
    return c.json(results);
})


export default app;
