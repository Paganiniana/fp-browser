import { Element, Node, Text } from "./elements";
import { TextMetrics } from "@/fonts";

type Token = Element | Text;

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
    tree:Node;

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

    constructor(tree:Node, w:number, h:number) {
        // set defaults
        this.TM = this.getFont();
        this.HSTEP = 13;
        let metrics = this.TM.metrics();
        this.VSTEP = metrics.linespace * 1.25;
        this.cursor_x = this.HSTEP;
        this.cursor_y = this.VSTEP;

        this.tree = tree;
        this.width = w;
        this.height = h;

        this.layout();
    }

    openTag(el: Element) {
        let tag = el.tag;
        let weight = "";

        // 1. <i>
        if (tag == "i") {
            weight = "italic";
            debugger;
        }

        // 2. <b>
        if (tag =="b") weight = "bold";

        // 3. <small>
        if (tag == "small") this.size -= 3;

        // 4. <big>
        if (tag == "big") this.size += 4;

        // 5. <p>
        if (tag == "p") {
            this.flush() // new line for paragraphs
            this.cursor_y += this.HSTEP;
        }

        this.TM = this.getFont(weight);
    }

    closeTag(el: Element) {
        let tag = el.tag;
        let weight = "";

        // 1. <i>
        if (tag == "i") weight = "";

        // 2. <b>
        if (tag =="b") weight = "";

        // 3. <small>
        if (tag == "small") this.size += 3;

        // 4. <big>
        if (tag == "big") this.size -= 4;

        this.TM = this.getFont(weight);

    }

    word(word:string) {
        let w = this.TM.measure(word);
        // wrap
        if (this.cursor_x + w > this.width) {
            this.flush();
        }

        this.line.push([this.cursor_x, word, this.TM])

        this.cursor_x += w + this.TM.measure(" ");
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
        // 2.5. set the starting X
        this.cursor_x = this.HSTEP;

        // 3. append the word
        for (let word of this.line) {
            this.display_list.push([word[0], this.cursor_y, word[1], word[2]]);
        }

        this.line=[];
    }

    layout() {
        // clear the list
        this.display_list = [];
        this.recurse(this.tree);
        console.log("Finished layout", this.display_list)
    }

    recurse(tree:Node) {

        if (tree instanceof Text) {
            let t = tree;
            // 2. draw text nodes
            let text = t.text!.trim();
            let words = text.split(" ");

            for (let word of words) {
                this.word(word);
            }
        } else {
            let E = tree;
            this.openTag(E as Element);
            for (let ch of E.getChildren()) {
                this.recurse(ch);
            }
            this.closeTag(E as Element);
        }
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