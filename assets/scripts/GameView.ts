import { Color, _decorator } from "cc";
import { baseNodeData } from "./baseLogic";
import { View } from "./playable/ui/View";
import { XunLu } from "./XunLu";

const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends View {

    @property(XunLu)
    readonly xunluNode: XunLu = null;

    onLoad() {
        let xunluData: baseNodeData;
        xunluData = {
            mapRow: 12,
            mapCol: 12,
            barriers: [[4, 5], [6, 7]],
            startX: 2,
            startY: 3,
            startColor: new Color(139, 94, 130, 255),
            roadColor: new Color(50, 61, 49, 255),
            barrierColor: new Color(0, 0, 0, 255),
            direction: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
        }
        this.xunluNode.initialize(xunluData);
    }
}