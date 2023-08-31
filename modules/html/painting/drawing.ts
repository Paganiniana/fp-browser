import { TextMetrics } from "@/fonts";

export class DrawText {
    top:number;
    left: number;
    bottom: number;

    text: string;
    font: TextMetrics;

    constructor(x:number, y:number, text:string, font:TextMetrics) {
        this.top  = y;
        this.left = x;
        this.text = text;
        this.font = font;
        this.bottom = y + font.metrics().linespace;
    }

    execute(scroll:number, ctx:CanvasRenderingContext2D) {
        ctx.font = this.font.ctx.font;
        ctx.fillStyle = this.font.ctx.fillStyle;
        ctx.strokeStyle = this.font.ctx.strokeStyle;
        ctx.fillText(this.text, this.left, this.top - scroll);
    }
}

export class DrawRect {
    top: number;
    left: number;
    bottom: number;
    right: number;
    color: string;

    constructor(x1:number, y1:number, x2:number, y2:number, color:string) {
        this.top = y1;
        this.left = x1;
        this.bottom = y2;
        this.right = x2;
        this.color = color;
    }

    execute(scroll:number, ctx: CanvasRenderingContext2D) {
        let w = this.right - this.left;
        let h = this.bottom - this.top;

        let oldFill = ctx.fillStyle;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.left, this.bottom - scroll, w, h);
        ctx.fillStyle = oldFill;
    }
}