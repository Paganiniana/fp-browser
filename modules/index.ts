import { fakeFetch } from "./fetch";
import { lex } from "./html/lex";

type DisplayType = [number, number, string][];

export class Browser {
    target:HTMLElement;
    ctx: CanvasRenderingContext2D;
    
    
    width: number;
    height: number;
    display_list: DisplayType = []

    scroll:number = 0;

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
        
        this.target = target;
        this.ctx = ctx;

        // 3. set event listeners
        this.registerEventListeners();
    }

    registerEventListeners() {
        window.addEventListener("keydown", this.keydownHandler.bind(this));
    }

    keydownHandler(e:KeyboardEvent) {
        let key = e.key.toLowerCase();
        let scrollChunk = 20;
        if (key == "arrowdown") {
            this.scroll += scrollChunk;
        } else if (key == "arrowup") {
            this.scroll -= scrollChunk;
        }
        this.draw();
    }

    scrollHandler(e:Event) {
        e.preventDefault();
        e.stopPropagation();
    }

    layout(text:string) {
        let HSTEP = 13;
        let VSTEP = 18;
        let cursor_x = HSTEP;
        let cursor_y = VSTEP;
        let display_list: DisplayType = [];

        for (let char of text) {
            display_list.push([cursor_x, cursor_y, char]);
            cursor_x += HSTEP;
            // wrap
            if (cursor_x > this.width) {
                cursor_x = 0;
                cursor_y += HSTEP;
            }
        }
        this.display_list = display_list;
    }

    draw() {
        // empty
        this.ctx.clearRect(0, 0, this.width, this.height);

        // draw everything in our layout
        let display_list = this.display_list;
        this.ctx.fillStyle = "black";
        for (let display of display_list) {
            let x = display[0];
            let y = display[1];
            let c = display[2];
            this.ctx.fillText(c, x, y - this.scroll);
        }
    }

    async load(url:string) {
        let res = await fakeFetch({
            url: url,
            method: "GET",
        })

        let text = lex(res.body);
        this.layout(text);
        this.draw();


    }
}