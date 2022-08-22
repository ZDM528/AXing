import { Component, instantiate, Prefab, UITransform, _decorator, Node, EventTouch, Vec3, Sprite, Color } from "cc";

const { ccclass, property } = _decorator;


interface baseNodeData {
    // g: number = 0;
    // h: number = 0;
    // f: number = 0;
    arr: [] = [0, 1]
    // squareRow = 12;
    // squareCol = 12;
    // parent: Node;
    // visited: boolean = false;

    // setCost(g: number, h: number, parent: Node) {
    //     this.g = g;
    //     this.h = h;
    //     this.f = this.g + this.h;
    //     this.parent = parent;
    // }

    // getCost() {
    //     return this.f;
    // }
}


@ccclass('XunLu')
export class XunLu extends Component {

    @property(Prefab)
    readonly square: Prefab = null;

    width: number = 0;
    height: number = 0;
    startX: number = 0;
    startY: number = 0;

    openList: number[][] = [];
    closeList: number[][] = [];
    squares: Node[][] = [];
    direction: number[][] = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    minTargetDistance: number = Infinity;
    nextMinX: number = 0;
    nextMinY: number = 0;
    onLoad() {
        this.width = this.node.getComponent(UITransform).width / squareCol;
        this.height = this.node.getComponent(UITransform).height / squareRow;
        this.generateSquare();
        this.initList();
    }

    initialize(data: baseNodeData) {
        let centerRow = squareRow / 2;
        let centerCol = squareCol / 2;
        for (let i = 0; i < squareRow; i++) {
            this.squares[i] = [];
            for (let j = 0; j < squareCol; j++) {
                let square = instantiate(this.square);
                square.positionX = (j - centerCol) * this.width + this.width / 2;
                square.positionY = (-i + centerRow) * this.height - this.height / 2;
                square.parent = this.node;
                this.squares[i][j] = square;
                this.initRoadCost(square)
                square.on(Node.EventType.TOUCH_START, this.searchStart, this);
            }
        }
    }

    initList() {
        this.openList = [];
        this.closeList = []
        for (let i = 0; i < this.squares.length; i++) {
            for (let j = 0; j < this.squares[0].length; j++) {
                // this.squares[i][j]['hasSearch'] = false;
                this.squares[i][j].getComponent(Sprite).color = new Color(255, 255, 255, 255);
            }
        }
        this.openList.push([this.startX, this.startY]);
        // this.squares[this.startX][this.startY]['hasSearch'] = true;
        this.minTargetDistance = Infinity;
        this.nextMinX = 0;
        this.nextMinY = 0;
    }

    generateSquare() {
        let centerRow = squareRow / 2;
        let centerCol = squareCol / 2;
        for (let i = 0; i < squareRow; i++) {
            this.squares[i] = [];
            for (let j = 0; j < squareCol; j++) {
                let square = instantiate(this.square);
                square.positionX = (j - centerCol) * this.width + this.width / 2;
                square.positionY = (-i + centerRow) * this.height - this.height / 2;
                square.parent = this.node;
                this.squares[i][j] = square;
                this.initRoadCost(square)
                square.on(Node.EventType.TOUCH_START, this.searchStart, this);
            }
        }
    }

    searchStart(event: EventTouch) {
        this.initList();
        let p = event.getUILocation();
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(p.x, p.y, 0));
        let targetY = Math.abs(Math.round((local.x - this.width / 2) / this.width + squareCol / 2));
        let targetX = Math.abs(Math.round(((local.y + this.height / 2) / this.height - squareRow / 2)));
        this.findRoad(targetX, targetY);
    }

    // //本质是广度遍历的优化
    findRoad(targetX: number, targetY: number) {
        while (this.openList.length > 0) {
            let size = this.openList.length;
            for (let i = 0; i < size; i++) {
                const [x, y] = this.openList.shift();
                this.resList.push([x, y]);
                this.squares[x][y]['hasSearch'] = true;  // 已经寻路存储在resList的不再寻路
                if (x == targetX && y == targetY) {
                    // this.showRoad();
                    break;
                }
                for (let j = 0; j < this.direction.length; j++) {
                    let nextX = x + this.direction[j][0];
                    let nextY = y + this.direction[j][1];
                    // this.getNearRoadXY(nextX, nextY, targetX, targetY);
                }
                this.openList.push([this.nextMinX, this.nextMinY]);
            }
        }
    }

    // showRoad() {
    //     for (let i = 0; i < this.resList.length; i++) {
    //         const [x, y] = this.resList[i]
    //         let square = this.squares[x][y];
    //         square.getComponent(Sprite).color = new Color(50, 61, 49, 255);
    //     }
    // }

    // getNearRoadXY(nextX: number, nextY: number, targetX: number, targetY: number) {  //寻找离目标点距离最近的方块
    //     if (nextX < 0 || nextX >= this.squares.length || nextY < 0 || nextY >= this.squares[0].length || this.squares[nextX][nextY]['hasSearch']) return;
    //     let distance = Math.abs(targetX - nextX) + Math.abs(targetY - nextY);
    //     if (this.minTargetDistance >= distance) {
    //         this.minTargetDistance = distance;
    //         this.nextMinX = nextX;
    //         this.nextMinY = nextY;
    //     }
    // }
}

//https://blog.csdn.net/qq_41517936/article/details/107044200?spm=1001.2101.3001.6650.16&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-16.pc_relevant_paycolumn_v3&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-16.pc_relevant_paycolumn_v3&utm_relevant_index=23