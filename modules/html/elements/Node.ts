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
        return this.children;
    }
}