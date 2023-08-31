import { Node, Element } from "@/html/elements";

export class TagSelector {
    tag:string;
    constructor(tag:string) {
        this.tag = tag;
    }

    matches(node:Node) {
        return node instanceof Element && node.tag == this.tag;
    }
}

export class DescendantSelector {
    ancestor:TagSelector | DescendantSelector;
    descendant:TagSelector;

    constructor(anc: TagSelector | DescendantSelector, desc: TagSelector) {
        this.ancestor = anc;
        this.descendant = desc;
    }

    matches(node: Node) {
        // 1. direct descendent comparison
        if (!this.descendant.matches(node)) {
            return false;
        }

        // 2. checks if 'parent' is ANYWHERE in the parent chain
        while (node.parent) {
            if (this.ancestor.matches(node.parent)) return true;
            node = node.parent;
        }
        return false;
    }
}