import { Component, Vec3, _decorator } from "cc";
import { xtween } from "./XTween";

const { ccclass, property } = _decorator;

@ccclass('TweenScale')
export class TweenScale extends Component {
    @property
    readonly scale: number = 0.1;
    @property
    readonly duration: number = 0.5;
    @property
    readonly delay: number = 1;
    // @property
    // readonly easing: string = "linear";
    @property
    readonly playOnLoad: boolean = true;

    onLoad(): void {
        if (this.playOnLoad) {
            this.scheduleOnce(this.startTween.bind(this), this.delay);
        }
    }

    public startTween(): void {
        xtween(this.node).repeatForever(true,
            xtween(this.node).by(this.duration, { scale: new Vec3(this.scale, this.scale, this.scale) })
        ).start();
    }
}