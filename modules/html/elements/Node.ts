export default class Node {
    private children: Node[] = [];
    parent: Node | null;

    constructor(parent:Node|null=null) {
        this.parent = parent;
    }

    addChild(N:Node) {
        this.children.push(N);
    }

    getChildren():Node[] {
        return [... this.children];
    }

    traverseWith(func: (n:Node) => void) {
        func(this);
        for (let ch of this.getChildren()) {
            ch.traverseWith(func);
        }
    }
}