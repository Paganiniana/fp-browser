import { Tag, Text } from "./elements";
import { TextMetrics } from "@/fonts";

type Token = Tag | Text;

// x, word, fonts
type LBDisplayType = [number, string, TextMetrics];
// x, y, word, fonts
type DisplayType = [number, number, string, TextMetrics]; 

const FONTS: {[key:string]: TextMetrics} = {}

export class Layout {
    // synced from browser main
    width:number;
    height:number

    // where the layout lives
    display_list: DisplayType[] = [];
    line:LBDisplayType[] = []; // this is a temporary buffer, used during layout
    tokens:Token[] = [];

    // used in layout loop
    TM: TextMetrics;
    HSTEP:number; // 13;
    VSTEP:number;
    cursor_x:number;
    cursor_y:number;

    // default styles
    defaultSize=16;
    size=this.defaultSize;
    style="Times";
    weight="";

    constructor(tokens:Token[], w:number, h:number) {
        // set defaults
        this.TM = this.getFont();
        this.HSTEP = 13;
        let metrics = this.TM.metrics();
        this.VSTEP = metrics.linespace * 1.25;
        this.cursor_x = this.HSTEP;
        this.cursor_y = this.VSTEP;

        this.tokens = tokens;
        this.width = w;
        this.height = h;

        this.init();
    }

    evaluateTag(t: Tag) {
        // configure the styles..
        let tagName = t.tag;
        let weight = "";
        // <i>
        if (tagName == "i")
            weight="italic";
        // <b>
        if (tagName == "b")
            weight="bold";
        // <small>
        if (tagName == "small")
            this.size -= 3;
        if (tagName == "/small")
            this.size += 3;
        // <big>
        if (tagName == "big")
            this.size += 4;
        if (tagName == "/big")
            this.size -= 4;

        
        this.TM = this.getFont(weight);
    }

    word(word:string) {
        this.line.push([this.cursor_x, word, this.TM])
    }

    /**
     * takes all of the words on a line, computes their Y pos
     * and moves them to this.display_list
     */
    flush() {
        // starting at 0 accounts for long <small> lines
        // 1. find the tallest word
        let largestAscent = 0;
        for (let word of this.line) {
            // 1. find line height
            let m = word[2].metrics();
            if (m.ascent > largestAscent) 
                largestAscent = m.ascent;
        }
        // 2. set the line height
        this.cursor_y += largestAscent * 1.25;

        // 3. append the word
        for (let word of this.line) {
            this.display_list.push([word[0], this.cursor_y, word[1], word[2]]);
        }

        this.line=[];
    }

    init() {
        // clear the list
        this.display_list = [];

        for (let t of this.tokens) {
            if (t instanceof Tag) {
                this.evaluateTag(t);
                continue;
            }
            
            // 2. draw text nodes
            let text = t.text!.trim();
            let words = text.split(" ");

            for (let word of words) {
                let w = this.TM.measure(word);
                // wrap
                if (this.cursor_x + w > this.width) {
                    this.flush();
                    this.cursor_x = this.HSTEP;
                }

                this.word(word);
                this.cursor_x += w + this.TM.measure(" ");
            }
        }

        console.log("Finished layout", this.display_list)
    }

    getFont(weight:string=this.weight) {
        let key = `${this.size}${this.style}${this.weight}`
        let font;

        if (!Object.keys(FONTS).includes(key)) {
            font = new TextMetrics({
                family: this.style,
                size: this.size,
                weight: weight,
            });
            FONTS[key] = font;
        } else {
            font = FONTS[key];
        }

        return font;
    }
}