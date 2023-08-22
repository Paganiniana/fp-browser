import { defineConfig } from "vite";

export default defineConfig({
    root: `${process.cwd()}/frontend/`,
    resolve: {
        alias: {
            "@": `${process.cwd()}/modules`,
        }
    },
    publicDir: `${process.cwd()}/pages`,
})