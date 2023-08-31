import { Element, Node, Text, BLOCK_ELEMENTS } from "./elements";
import { TextMetrics } from "@/fonts";
import { DrawRect, DrawText } from "./painting/drawing";

type Token = Element | Text;

// x, word, fonts
type LBDisplayType = [number, string, TextMetrics];
// x, y, word, fonts
type DisplayType = DrawText | DrawRect;

const FONTS: {[key:string]: TextMetrics} = {}

interface Layout {
    node: Node,
    x:number, // positions!
    y:number, // positions!
    width: number, // size
    height:number, // size
    parent: null | Layout,
    previous: null | Layout,
    children: Layout[],
    display_list: DisplayType[],
    layout(): void,
    paint(display_list: DisplayType[]): void,
}

export class BlockLayout implements Layout {
    // currently active nodes
    node: Node;
    
    // layout relationships
    parent: Layout;
    previous: Layout | null;
    children: Layout[] = [];

    // positions / size
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0; 

    // where the layout lives
    display_list: DisplayType[] = [];
    line:LBDisplayType[] = []; // this is a temporary buffer, used during layout

    // used in layout loop
    TM: TextMetrics;
    HSTEP:number; // 13;
    VSTEP:number;
    cursor_x:number;
    cursor_y:number;

    // used for text rendering
    size=16;
    style="Times";
    weight="";

    constructor(node: Node, parent: Layout, previous: Layout | null) {
        // assignments
        this.node = node;
        this.parent = parent;
        this.previous = previous;

        // some defaults defaults
        this.TM = this.getFont();
        let metrics = this.TM.metrics();
        
        this.HSTEP = 13;
        this.VSTEP = metrics.linespace * 1.25;

        this.cursor_x = this.HSTEP;
        this.cursor_y = this.VSTEP;
    }

    layout() {
        // 0. compute position & height
        this.x = this.parent.x;
        this.width = this.parent.width;

        if (this.previous)
            this.y = this.previous.y + this.previous.height;
        else 
            this.y = this.parent.y;


        // 1. determine layout mode
        let mode = this.layoutMode();
        
        // clear the list
        this.display_list = [];

        // 2. do layout
        if (mode == "block") {
            let previous: Layout | null = null;
            for (let child of this.node.getChildren()) {
                let next:BlockLayout = new BlockLayout(child, this, previous);
                this.children.push(next);
                previous = next;
            }
        } else if (mode == "inline") {
            // set defaults
            this.cursor_x = 0;
            this.cursor_y = 0;
            this.setDefaults();

            this.line = [];
            this.recurse(this.node);
            this.flush();
        }

        // 3. trigger layout in children
        for (let ch of this.children) {
            ch.layout();
        }

        // 4. compute height
        if (mode == "block") {
            this.height = 0;
            for (let ch of this.children)
                this.height+= ch.height;
        } else if (mode == "inline") {
            this.height = this.cursor_y;
        }
    }

    layoutMode(): "inline" | "block" {
        let nodeChildren = this.node.getChildren();
        
        // 1. this is a text node
        if (this.node instanceof Text) {
            return "inline";
        }
        // 2. NOT a text node, with children
        else if (nodeChildren.length) {
            let hasBlockElement = nodeChildren.some(ch => ch instanceof Element && BLOCK_ELEMENTS.includes(ch.tag));
            // 2a. has block children
            if (hasBlockElement) return "block";
            // 2a. doesn't have block children
            else return "inline";
        }
        // 3. NOT a text node, without children
        else {
            return "block";
        }
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
        if (!this.line.length) return;

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
        let baseline = this.cursor_y + 1.25 * largestAscent;

        // 3. append the word
        for (let word of this.line) {
            let m = word[2].metrics();
            let x = this.x + word[0];
            let y = this.y + baseline + m.ascent;
            this.display_list.push(new DrawText(x, y, word[1], word[2]));
        }

        // 4. reset line
        this.cursor_x = 0;
        this.line = [];

        // 5. increment cursor by max descent
        let largestDescent = 0;
        for (let word of this.line) {
            // 1. find line height
            let m = word[2].metrics();
            if (m.descent > largestDescent) 
                largestDescent = m.descent;
        }

        this.cursor_y = baseline + 1.25 * largestDescent;
    }


    paint(displayList:DisplayType[]) {
        // 0. check for styles on node
        if (this.node instanceof Element) {
            // background
            let bgColor = this.node.style["background-color"] ? this.node.style["background-color"] : "rgba(0,0,0,0)";
            let x2 = this.x + this.width;
            let y2 = this.y + this.height;
            let R = new DrawRect(this.x, this.y, x2, y2, bgColor);
            displayList.push(R);
            
            // color
            let textColor = this.node.style["color"] ? this.node.style["color"] : "black";
            this.TM.setFontColor(textColor);
        }

        // 1. preformatted text
        if (this.node instanceof Element && this.node.tag == "pre") {
            let x2 = this.x + this.width;
            let y2 = this.y + this.height;
            let rect = new DrawRect(this.x, this.y, x2, y2, "gray");
            displayList.push(rect);
        }

        // 2. inline/text
        if (this.layoutMode() == "inline") {
            for (let dl of this.display_list) {
                let text = dl as DrawText;
                let copy = new DrawText(text.left, text.top, text.text, text.font);
                displayList.push(copy);
            }
        }

        // 3. continue recursively
        for (let ch of this.children)
            ch.paint(displayList);
    }

    token(tok: Text | Element) {
        if (tok instanceof Text) {
            for (let word of tok.text.split(" ")) {
                this.word(word);
            }
        }
        else {
            if (tok.tag == "i") this.style = "italic";
            if (tok.tag == "/i") this.style = "";
            if (tok.tag == "b") this.style = "bold";
            if (tok.tag == "/b") this.style = "";
            if (tok.tag == "small") this.size -= 2;
            if (tok.tag == "/small") this.size += 2;
            if (tok.tag == "big") this.size += 4;
            if (tok.tag == "/big") this.size -= 4;
            if (tok.tag == "br") this.flush();
            if (tok.tag == "/p") {
                this.flush();
                this.cursor_y += this.VSTEP;
            }
        }
    }

    openTag(el: Element) {
        let tag = el.tag;
        let weight = "";

        // 1. <i>
        if (tag == "i") {
            weight = "italic";
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

    recurse(node:Node) {
        if (node instanceof Text) {
            let t = node;
            // 2. draw text nodes
            let text = t.text!.trim();
            let words = text.split(" ");

            for (let word of words) {
                this.word(word);
            }
        } else {
            let E = node;
            this.openTag(E as Element);
            for (let ch of E.getChildren()) {
                this.recurse(ch);
            }
            this.closeTag(E as Element);
        }
    }

    defaultSize=16;
    defaultStyle="Times";
    defaultWeight="";
    setDefaults() {
        this.size = this.defaultSize;
        this.style = this.defaultStyle;
        this.weight = this.defaultWeight;
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

export class DocumentLayout implements Layout {
    // currently active nodes
    node: Node;
    parent = null;
    previous = null;
    children: Layout[] = [];

    // display
    display_list: DisplayType[] = [];

    // position and size
    x = 0;
    y = 0;
    width;
    height;

    constructor(node:Node, width: number, height: number) {
        // we can clearly state that all of these will be null
        this.node = node;

        this.width = width;
        this.height = height;
    }

    layout() {
        
        // do layout
        let child = new BlockLayout(this.node, this, null);
        this.children.push(child);
        child.layout();

        // update height
        this.display_list = child.display_list;
        this.height = child.height;
    }

    paint(dl: DisplayType[]) {
        this.children[0].paint(this.display_list);
    }
}