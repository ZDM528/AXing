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
            // barriers: [[3, 5], [4, 5], [5, 5], [6, 5], [7, 5]],
            barriers: [[4, 5], [5, 4], [5, 6], [6, 5]],
            startX: 2,
            startY: 3,
            startColor: new Color(139, 94, 130, 255),
            roadColor: new Color(50, 61, 49, 255),
            barrierColor: new Color(0, 0, 0, 255),
            direction: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]]
            // direction: [[0, 1], [0, -1], [1, 0], [-1, 0]]
        }
        this.xunluNode.initialize(xunluData);
    }
}