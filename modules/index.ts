import { fakeFetch } from "./fetch";
import { lex } from "./html/lex";

export class Browser {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;

    constructor(target:HTMLElement) {
        console.log("Initiating the browser...")
        // 1. mount
        const C = document.createElement("canvas");
        let bb = target.getBoundingClientRect();
        C.width = bb.width;
        C.height = bb.height;
        this.width = bb.width;
        this.height = bb.height;
        C.style.width = "100%";
        C.style.height = "100%";
        target.appendChild(C);

        // 2. get the rendering context
        let ctx = C.getContext("2d");
        if (!ctx) throw new Error("Cannot mount without a context!");
        this.ctx = ctx;
    }

    async load(url:string) {
        // TODO
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(0, 0, 500, 500);

        let res = await fakeFetch({
            url: url,
            method: "GET",
        })

        let text = lex(res.body);
        this.ctx.fillStyle = "black";

        // draw
        let HSTEP = 13;
        let VSTEP = 18;
        let cursor_x = HSTEP;
        let cursor_y = VSTEP;

        for (let char of text) {
            this.ctx.fillText(char, cursor_x, cursor_y);
            cursor_x += HSTEP;
            // wrap
            if (cursor_x > this.width) {
                cursor_x = 0;
                cursor_y += HSTEP;
            }
        }
    }
}