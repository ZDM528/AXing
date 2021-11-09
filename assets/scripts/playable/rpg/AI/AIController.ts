import Timer from "../../extenstion/Timer";
import CharacterComponent from "../CharacterComponent";
import { AIState } from "./AIState";
import AIStateGraph from "./AIStateGraph";

/**
 * AI控制器，用来控制AI各个状态节点的转换
 */
export default class AIController extends CharacterComponent {
    /** 默认空状态，当一个AIState执行结束后，转到结果分支，而该分支没有配置，则会转到空状态 */
    public static readonly EmptyState = new AIState();
    #timer: Timer;
    public get timer() { return this.#timer; }
    #graph: AIStateGraph;
    /** AI状态图 */
    public get graph() { return this.#graph; }
    #currentState: AIState;
    public get currentState() { return this.#currentState; }
    #variableBoard = new Map<any, any>();

    /**
     * #### 初始化AI控制器
     * @param character 所属的角色
     * @param graph AI状态图
     */
    public initialize(graph: AIStateGraph): void {
        this.#graph = graph;
        for (let aiState of graph.iterableAIStates())
            aiState.initialize(this);
        this.character.finalizeEvent.AddEvent(this.clearStates.bind(this));
        this.character.scheduleOnce(() => {
            if (this.character.enabled)
                this.onEnable();
        }, 0.001);
        this.#timer = this.character.addComponent(Timer);
    }

    public finalize(): void {
        this.timer.offAll();
    }

    /**
     * 设置状态图变量
     * @param type 变量名
     * @param value 变量值
     */
    public setVariable<T extends AnyConstructor>(type: T | PropertyKey, value: InstanceType<T>): void {
        this.#variableBoard.set(type, value);
    }

    /**
     * 获得状态图变量
     * @param type 变量名
     * @returns 返回变量值
     */
    public getVariable<T extends AnyConstructor>(type: T | PropertyKey): InstanceType<T> {
        return this.#variableBoard.get(type);
    }

    onEnable(): void {
        if (this.graph != null && this.graph.defaultState) {
            this.#currentState = this.graph.defaultState;
            this.#currentState.enter();
        }
        this.timer.onUpdate(this.onUpdate, this);
    }

    onUpdate(): void {
        if (this.#currentState != null)
            this.#currentState.onUpdate();
    }

    onDisable(): void {
        this.timer.offUpdate(this.onUpdate, this);
        this.clearStates();
    }

    /**
     * 打断当前状态
     */
    public interruptCurrentState(): void {
        this.currentState.interrupt();
    }

    /**
     * 强制切换状态
     * @param state 新的状态，没填为默认状态
     */
    public forceChangeState(state: AIState = this.graph.defaultState): void {
        this.currentState?.interrupt();
        this.#currentState = state;
        this.#currentState.enter();
    }

    /**
     * 清除当前运行的状态
     */
    public clearStates(): void {
        if (this.#currentState != null) {
            this.#currentState.exit();
            this.#currentState = null;
        }
    }

    /**
     * 状态运行结束回调，内部函数，外部请勿调用。
     * @param state 运行结束的状态
     * @param result 运行结果
     */
    public onStateFinished(state: AIState, result: boolean | number): void {
        if (state != this.#currentState) return;
        let nextState = this.graph.getNodeResult(state, result) ?? AIController.EmptyState;
        this.#currentState = nextState;
        this.translateState(state, nextState);
    }

    /**
     * 状态转换
     * @param currentState 当前状态
     * @param nextState 下一个状态
     */
    public translateState(currentState: AIState, nextState: AIState): void {
        currentState.exit();
        nextState.enter();
    }
}