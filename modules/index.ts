import { fakeFetch } from "./fetch";
import { TextMetrics } from "./fonts";
import { lex, LexResult } from "./html/lex";
import { Text, Tag } from "./html/elements";

type DisplayType = [number, number, string, TextMetrics][];

export class Browser {
    target:HTMLElement;
    ctx: CanvasRenderingContext2D;
    
    width: number;
    height: number;
    display_list: DisplayType = []

    scroll:number = 0;

    // default styles
    defaultFontSize=16;
    defaultFontFam="Times";
    defaultFontWeight="";

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

    getFont(weight:string=this.defaultFontWeight) {
        let font = new TextMetrics({
            family: this.defaultFontFam,
            size: this.defaultFontSize,
            weight: weight,
        })
        return font;
    }

    setDrawFont(f: TextMetrics) {
        this.ctx.font = f.ctx.font;
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

    layout(tokens:LexResult) {
        let TM = this.getFont();
        let metrics = TM.metrics();

        let HSTEP = 13;
        let VSTEP = metrics.linespace * 1.25;
        let cursor_x = HSTEP;
        let cursor_y = VSTEP;
        let display_list: DisplayType = [];


        console.log("Laying out...", tokens);

        for (let t of tokens) {
            if (t instanceof Tag) {
                // configure the styles..
                let tagName = t.tag;
                let weight = "";
                if (tagName == "i")
                    weight="italic";
                if (tagName == "b")
                    weight="bold";
                TM = this.getFont(weight);
                console.log("Setting weight", weight)

                continue;
            }
            
            // 2. draw text nodes
            let text = t.text!.trim();
            let words = text.split(" ");

            for (let word of words) {
                let w = TM.measure(word);
                // wrap
                if (cursor_x + w > this.width) {
                    cursor_x = HSTEP;
                    cursor_y += VSTEP;
                }
    
                display_list.push([cursor_x, cursor_y, word, TM]);
                cursor_x += w + TM.measure(" ");
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
            // 1. skip anything that's off-screen
            if (y > this.scroll + this.height) continue;
            if (y < this.scroll) continue;
            
            // 2. account for font styles
            this.setDrawFont(display[3]);

            // 3. draw!
            this.ctx.fillText(c, x, y - this.scroll);
        }
    }

    async load(url:string) {
        let res = await fakeFetch({
            url: url,
            method: "GET",
        })

        let tokens = lex(res.body);
        this.layout(tokens);
        this.draw();


    }
}