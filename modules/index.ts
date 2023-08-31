import { fakeFetch } from "./fetch";
import { TextMetrics } from "./fonts";
import { Node, Element } from "./html/elements";
import { parseHtml } from "./html";
import { DocumentLayout } from "./html/layout";

export class Browser {
    target:HTMLElement;
    ctx: CanvasRenderingContext2D;
    
    width: number;
    height: number;

    lastLayout: DocumentLayout | undefined;
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

    style(n:Node) {
        n.traverseWith((n) => {
            console.log("Traversing!")
            if (n instanceof Element) { 
                // @ts-ignore
                n.parseStyle();
            }
        })
        
    }

    layout(tree:Node) {
        this.lastLayout = new DocumentLayout(tree, this.width, this.height);
        this.lastLayout.layout();
        this.lastLayout.paint(this.lastLayout.display_list);
    }

    draw() {
        let L = this.lastLayout;
        let display_list;
        if (L) display_list = L.display_list;
        else return;

        // empty
        this.ctx.clearRect(0, 0, this.width, this.height);

        // draw everything in our layout
        this.ctx.fillStyle = "black";
        for (let cmd of display_list) {
            // 1. skip anything that's off-screen
            if (cmd.top > this.scroll + this.height) continue;
            if (cmd.bottom < this.scroll) continue;
            
            // 2. draw
            cmd.execute(this.scroll, this.ctx);
        }
    }

    async load(url:string) {
        let res = await fakeFetch({
            url: url,
            method: "GET",
        })

        // 1. parse
        let parsedDom = parseHtml(res.body);
        let B = parsedDom.parse();
        console.log(B);

        // 2. styles
        this.style(parsedDom.root);

        // 3. layout
        this.layout(parsedDom.root);
        this.draw();
    }
}