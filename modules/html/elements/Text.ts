import Node from "./Node";

export default class Text extends Node {
    text:string;
    constructor(parent: Node | null, text:string) {
        super(parent);
        this.text = text;
    }

    toString() {
        return this.text;
    }
}