import { Element, Node, Text, BLOCK_ELEMENTS } from "./elements";
import { TextMetrics } from "@/fonts";

type Token = Element | Text;

// x, word, fonts
type LBDisplayType = [number, string, TextMetrics];
// x, y, word, fonts
type DisplayType = [number, number, string, TextMetrics]; 

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
        // set defaults
        this.TM = this.getFont();
        this.HSTEP = 13;
        let metrics = this.TM.metrics();
        this.VSTEP = metrics.linespace * 1.25;
        this.cursor_x = this.HSTEP;
        this.cursor_y = this.VSTEP;

        // assignments
        this.node = node;
        this.parent = parent;
        this.previous = previous;
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
        this.cursor_x = 0;

        // 3. append the word
        for (let word of this.line) {
            let x = this.x + word[0];
            let y = this.y - largestAscent; // + "baseline" ?
            this.display_list.push([x, y, word[1], word[2]]);
        }

        this.line=[];
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

    layout() {
        // 0. compute position & height
        this.x = this.parent.x;
        if (this.previous)
            this.y = this.previous.y + this.previous.height;
        else 
            this.y = this.parent.y;

        this.width = this.parent.width;


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

        // 4. gather child layouts
        for (let ch of this.children) {
            this.display_list = [... this.display_list, ... ch.display_list];
        }

        if (this.display_list.length) {
            console.log("We have a display list!", this);
        }

        // 5. compute height
        if (mode == "block") {
            this.height = 0;
            for (let ch of this.children)
                this.height+= ch.height;
        } else if (mode == "inline") {
            this.height = this.cursor_y;
        }
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


    paint(dl:DisplayType[]) {
        for (let ch of this.children) {
            ch.paint(dl);
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
        this.children[0].paint(dl);
    }
}