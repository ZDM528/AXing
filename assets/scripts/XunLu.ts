import { Component, instantiate, Prefab, UITransform, _decorator, Node, EventTouch, Vec3, Sprite, Color } from "cc";
import { baseNodeData, GridNode as GridNode } from "./baseLogic";

const { ccclass, property } = _decorator;

@ccclass('XunLu')
export class XunLu extends Component {

    @property(Prefab)
    readonly grid: Prefab = null;

    openList: number[][] = [];
    closeList: number[][] = [];
    resList: number[][] = []
    targetX: number = 0;
    targetY: number = 0;

    data: baseNodeData;
    girdNodes: GridNode[][] = [];
    width: number = 0;
    height: number = 0;

    minX: number = 0;
    minY: number = 0
    maxDistance = Infinity;

    initialize(data: baseNodeData) {
        this.data = data;
        this.width = this.node.getComponent(UITransform).width / data.mapCol;
        this.height = this.node.getComponent(UITransform).height / data.mapRow;
        this.generateGrid();
        this.initList();
    }

    generateGrid() {
        let centerRow = this.data.mapRow / 2;
        let centerCol = this.data.mapCol / 2;
        for (let i = 0; i < this.data.mapRow; i++) {
            this.girdNodes[i] = [];
            for (let j = 0; j < this.data.mapCol; j++) {
                let gird = instantiate(this.grid);
                gird.parent = this.node;
                gird.active = true;
                let gridNode = new GridNode(gird);
                gird.positionX = (j - centerCol) * this.width + this.width / 2;
                gird.positionY = (-i + centerRow) * this.height - this.height / 2;
                this.girdNodes[i][j] = gridNode;
                gird.on(Node.EventType.TOUCH_START, this.searchStart, this);
            }
        }
    }

    initList() {
        this.openList = [];
        this.closeList = [];
        this.resList = [];
        this.maxDistance = Infinity;
        this.minX = 0;
        this.minY = 0;
        for (let i = 0; i < this.girdNodes.length; i++) {
            for (let j = 0; j < this.girdNodes[0].length; j++) {
                this.girdNodes[i][j].node.getComponent(Sprite).color = new Color(255, 255, 255, 255);
            }
        }
        this.girdNodes[this.data.startX][this.data.startY].node.getComponent(Sprite).color = this.data.startColor;
        for (let i = 0; i < this.data.barriers.length; i++) {
            let barrierPoint = this.data.barriers[i];
            this.girdNodes[barrierPoint[0]][barrierPoint[1]].node.getComponent(Sprite).color = this.data.barrierColor;
        }
        this.openList.push([this.data.startX, this.data.startY]);
    }

    searchStart(event: EventTouch) {
        this.initList();
        let p = event.getUILocation();
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(p.x, p.y, 0));
        let targetY = Math.abs(Math.round((local.x - this.width / 2) / this.width + this.data.mapCol / 2));
        let targetX = Math.abs(Math.round(((local.y + this.height / 2) / this.height - this.data.mapRow / 2)));
        this.targetX = targetX;
        this.targetY = targetY;
        this.findRoad();
    }

    findRoad() {
        let index: number = 0;
        while (this.openList.length > 0) {
            for (let i = 0; i < this.openList.length; i++) {
                const [x, y] = this.openList[i];
                let gird = this.girdNodes[x][y];
                if (gird.f < this.maxDistance) {
                    this.minX = x;
                    this.minY = y;
                    index = i;
                }
            }
            this.openList.splice(index, 1);
            this.closeList.push([this.minX, this.minY]);
            this.resList.push([this.minX, this.minY]);
            if (this.minX == this.targetX && this.minY == this.targetY) {
                this.showRoad();
                break;
            }
            this.findNeighbor(this.minX, this.minY);
        }
    }

    findNeighbor(x: number, y: number) {
        let curNode = this.girdNodes[x][y];
        for (let i = 0; i < this.data.direction.length; i++) {
            let direction = this.data.direction[i];
            let nextX = direction[0] + x;
            let nextY = direction[1] + y;
            if (nextX < 0 || nextX >= this.girdNodes.length || nextY < 0 || nextY >= this.girdNodes[0].length) return;
            let touchBarrier = this.touchBarrier(nextX, nextY);
            if (touchBarrier) return;
            let isInlCloseList = this.isInlCloseList(nextX, nextY);
            if (isInlCloseList) return;
            let isInOpenList = this.isInOpenList(nextX, nextY);
            if (isInOpenList) {
                let grid = this.girdNodes[nextX][nextY];
                let g = curNode.g + 1;
                let h = this.getTargetDistance(nextX, nextY);
                if (g + h < grid.f) {
                    grid.setCost(g, h, curNode.node);
                }
            } else {
                this.openList.push([nextX, nextY]);
                let grid = this.girdNodes[nextX][nextY];
                let g = curNode.g + 1;
                let h = this.getTargetDistance(nextX, nextY);
                grid.setCost(g, h, curNode.node);
            }
        }
    }

    getTargetDistance(nextX: number, nextY: number) {
        let distance = Math.abs(this.targetX - nextX) + Math.abs(this.targetY - nextY);
        return distance;
    }


    touchBarrier(nextX: number, nextY: number) {
        let isTouchBarrier: boolean = false;
        for (let k = 0; k < this.data.barriers.length; k++) {
            let barrierX = this.data.barriers[k][0];
            let barrierY = this.data.barriers[k][1];
            if (nextX == barrierX && nextY == barrierY) {
                isTouchBarrier = true;
                break;
            }
        }
        return isTouchBarrier;
    }

    isInOpenList(nextX: number, nextY: number) {
        let isInOpenList: boolean = false;
        for (let k = 0; k < this.openList.length; k++) {
            let openX = this.openList[k][0];
            let openY = this.openList[k][1];
            if (nextX == openX && nextY == openY) {
                isInOpenList = true;
                break;
            }
        }
        return isInOpenList;
    }

    isInlCloseList(nextX: number, nextY: number) {
        let isInCloseList: boolean = false;
        for (let k = 0; k < this.closeList.length; k++) {
            let closeX = this.closeList[k][0];
            let closeY = this.closeList[k][1];
            if (nextX == closeX && nextY == closeY) {
                isInCloseList = true;
                break;
            }
        }
        return isInCloseList;
    }


    showRoad() {
        if (this.resList.length == 1) {
            console.log('死路');
        }
        let gird = this.girdNodes[this.targetX][this.targetY].node;
        // while (gird) {
        //     console.log(gird, gird.getComponent(Sprite), 'aaaaaaaaaaa');
        //     gird.getComponent(Sprite).color = this.data.roadColor;
        //     gird = gird.parent;
        // }
    }
}

//https://blog.csdn.net/qq_41517936/article/details/107044200?spm=1001.2101.3001.6650.16&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-16.pc_relevant_paycolumn_v3&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-16.pc_relevant_paycolumn_v3&utm_relevant_index=23