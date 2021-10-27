import { Canvas, Component, instantiate, Prefab, resources, _decorator } from "cc";
import { View } from "../ui/View";
import { ISystem } from "./RegisterSystem";

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    public static get instance() { return GameManager._instance; }
    private static readonly systemList: ISystem[] = [];

    @property(Canvas)
    readonly canvas: Canvas = null;
    @property
    readonly gameViewPath: string = "prefabs/gameView";
    @property
    readonly endingViewPath: string = "prefabs/endingView";

    #gameView: View;
    public get gameView() { return this.#gameView; }
    #endingView: View;
    public get endingView() { return this.#endingView; }

    __preload(): void {
        GameManager._instance = this;
    }

    public async initialize(): Promise<void> {
        resources.preload(this.endingViewPath);
        await this.createGameView();
    }

    public async createGameView(): Promise<void> {
        this.#gameView = await this.createView<View>(this.gameViewPath);
        this.gameView.node.setParent(this.canvas.node);
        this.gameView.intialize();
    }

    public hideGameView(): void {
        this.gameView.node.active = false;
    }

    public getGameView<T extends View>(): T {
        return this.gameView as T;
    }

    public async createEndingView<T extends View>(...params: Parameters<T["intialize"]>): Promise<void> {
        this.#endingView = await this.createView<View>(this.endingViewPath);
        this.endingView.node.setParent(this.canvas.node);
        this.endingView.intialize(...params);
    }

    public hideEndingView(): void {
        this.endingView.node.active = false;
    }

    public getEndingView<T extends View>(): T {
        return this.endingView as T;
    }

    public async createView<T extends View>(path: string): Promise<View> {
        let prefab = await new Promise<Prefab>(resolve => resources.load(path, Prefab, (error, data) => resolve(data)));
        let viewNode = instantiate(prefab);
        return viewNode.getComponent(View);
    }

    public static registerSystem(system: ISystem): void {
        GameManager.systemList.push(system);
    }
}