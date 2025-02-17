import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    resolve: {
        alias: {
            "@components": "/src/components",
        },
    },
    base: process.env.VITE_BASE_PATH || "/deploy_react_app_github_pages_vercel",
});

