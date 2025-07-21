import { SceneManager } from "@plan8/klang";
interface VOEvent {
    key: string;
    timeout: number;
}
export interface VOPartConfig {
    name: string;
    events: Array<VOEvent>;
}
interface StopOptions {
    setCompleted?: boolean;
    stopImmediately?: boolean;
}
declare class VOPart {
    private config;
    private timeoutId;
    private endTimeoutId;
    private sceneManager;
    private currentIndex;
    private callback;
    private currentKey;
    private timerPausedAt;
    private timerRemaining;
    private timeoutTargetTime;
    constructor(config: VOPartConfig, sceneManager: SceneManager, callback?: Function);
    start(): void;
    getCurrentIndex(): number;
    stop(options?: StopOptions): void;
    reset(): void;
    pauseCurrent(): void;
    resumeCurrent(): void;
    private triggerKey;
}
export default VOPart;
