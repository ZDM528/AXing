import { Color, Node } from "cc";

export interface baseNodeData {
    mapRow: number;
    mapCol: number;
    barriers: number[][];
    startX: number;
    startY: number;
    startColor: Color,
    roadColor: Color,
    barrierColor: Color
    direction: number[][]
}

export class GridNode {
    g: number = 0;
    h: number = 0;
    f: number = 0;
    parent: Node;
    node: Node;

    constructor(node: Node) {
        this.node = node;
    }

    setCost(g: number, h: number, parent: Node) {
        this.g = g;
        this.h = h;
        this.f = this.g + this.h;
        this.parent = parent;
    }

    getCost() {
        return this.f;
    }
}