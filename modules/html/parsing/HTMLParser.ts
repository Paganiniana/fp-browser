import { Node, Text, Element, HEAD_TAGS } from "../elements";

export default class HTMLParser {
    body:string;
    root:Node = new Node();
    unfinished:Element[] = []

    constructor(body:string) {
        this.body = body;
    }

    getLastUnfinished(): Node | null {
        if (this.unfinished.length) 
            return this.unfinished[this.unfinished.length -1];
        else
            return null;
    }

    parse() {
        console.log("parsing...", this.body);
        let text = "";
        let inTag = false;
        for (let char of this.body) {
            if (char == "<") {
                // 1. add the text we've collected and start the tag
                inTag  = true;
                if (text) this.addText(text);
                text = "";
            } else if (char == ">") {
                // 2. finish the tag
                inTag = false;
                this.addTag(text);
                text = "";
            } else {
                // 3. collect the text
                text += char;
            }
        }


        // collect any left overs...
        if (!inTag && text) this.addText(text);

        return this.finish()
    }

    addText(text:string) {
        if (text == " ") return; // ignore whitespace

        // 1. confirm dom shape up to now...
        this.implicitTags(null);

        let parent = this.getLastUnfinished();
        let T = new Text(parent, text);
        parent?.addChild(T);
    }

    addTag(tagText:string) {

        // 1. it's a tag we want to ignore
        if (tagText.startsWith("!")) {
            return; // ignore   
        }

        // 2. it's a tag we're finishing
        else if (tagText.startsWith("/")) {
            // finishing just means removing it from "unfinished"
            this.unfinished.pop();
        }
        // 3. it's a new tag
        else {
            let parent = this.getLastUnfinished();
            let E = new Element(parent, tagText);

            // confirm dom shape up to now...
            this.implicitTags(E);

            if (!parent) this.root.addChild(E);
            else parent.addChild(E);

            // check for self-closers
            if (!E.isSelfClosing())
                this.unfinished.push(E);
        }
    }

    implicitTags(E:Element | null) {
        let tag = E?.tag;
        if (!tag) return;

        while (true) {
            let openTags = this.unfinished.map(t => t.tag);
            
            // 1. no html
            if (!openTags.length && tag != "html") {
                this.addTag("html");
            }
            // 2. first container after html
            else if (openTags.length == 1 
                && !["head", "body", "/html"].includes(tag)) {
                    if (HEAD_TAGS.includes(tag)) this.addTag("head");
                    else this.addTag("body");
            }
            // 3. closing an unfinished head tag
            else if (openTags.length == 2 && openTags[0] == "html"
                && openTags[1] == "head" && !["/head", ... HEAD_TAGS].includes(tag)) {
                    this.addTag("/head");
            } 
            // 4. end the loop!
            else {
                break;
            }
        }
    }


    /**
     * ??
     */
    finish() {
        // 1. finish up anything that needs finishing
        while (this.unfinished.length > 0) {
            this.unfinished.pop();
        }

        // 2. return the document 
        return this.root;
    }
}