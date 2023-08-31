import Node from "./Node";
import { SELF_CLOSING_TAGS } from ".";
import { CSSParser } from "@/css/CSSParser";


export default class Element extends Node {
    tag!:string;
    attributes: { [key:string]: any} = {};
    style: { [key:string]: string } = {};

    constructor(parent: Node | null, tagString:string) {
        super(parent);
        this.parse(tagString);
    }

    parse(tagString:string) {
        // 1. get just the tag name
        let parts = tagString.split(" ");
        this.tag = parts.splice(0, 1)[0] // remove the tag from 'parts'
        this.tag = this.tag.toLowerCase(); // lowercase it

        // 2. get the attributes
        for (let attr of parts) {
            if (attr.includes("=")) {
                // it's a key/value pair
                let splitIndex = attr.indexOf("=") // only get the *first* one!
                let key = attr.slice(0, splitIndex); 
                // avoid double quotes surrounding the value
                let value = attr.slice(splitIndex + 2, attr.length - 1); 
                this.attributes[key.toLowerCase()] = value;
            } else {
                // it's a boolean attribute
                this.attributes[attr] = ""; // doesn't matter what value it is
            }
        }
    }

    parseStyle() {
        if (Object.keys(this.attributes).includes("style")) {
            let pairs = new CSSParser(this.attributes["style"]).body();
            // console.log("Found styles on ", this);
            // console.log("parsed", this.attributes["style"], pairs);
            for (let key of Object.keys(pairs)) {
                this.style[key] = pairs[key];
            }
        }
    }

    toString() {
        return `<${this.tag}>`
    }

    isSelfClosing() {
        return SELF_CLOSING_TAGS.includes(this.tag);
    }

}