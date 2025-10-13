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
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {

                    // 分离 React 相关依赖
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'react-vendor';
                        }
                        // 其余第三方库
                        return 'vendor';
                    }

                    // 按路由或目录划分
                    if (id.includes('/src/react-app/pages/')) {
                        const name = id.split('/src/react-app/pages/')[1].split('/')[0];
                        return `page-${name}`;
                    }

                    return 'main';
                },
            },
        },
    },
});
