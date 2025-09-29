import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), cloudflare(), tailwindcss()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src/react-app"), // 针对 React 应用
            "@worker": resolve(__dirname, "./src/worker"), // 针对 Worker
        },
    },
    server: {
        host: "0.0.0.0"
    }
});
