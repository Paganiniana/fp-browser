import { defineConfig } from "vite";

export default defineConfig({
    root: `${process.cwd()}/browser/`,
    resolve: {
        alias: {
            "@": `${process.cwd()}/modules`,
        }
    }
})