import { SceneManager } from "@plan8/klang";
export default abstract class InteractiveLayerBase {
    initializingElement: HTMLElement;
    onInit?: () => Promise<void>;
    appFSM?: unknown;
    sceneManager: SceneManager;
    constructor({ initializingElement, onInit, sceneManager, appFSM }: {
        initializingElement: any;
        onInit: any;
        sceneManager: any;
        appFSM: any;
    });
    init(): Promise<void>;
    initAudio(): Promise<void>;
    setMute(shouldMute: boolean): void;
    setBlurMute(shouldMute: boolean): void;
    disableBlurMute(disabled: boolean): void;
    changeScene(sceneName: string | number): void;
    trigger(key: string, options?: any): void;
    triggerForScene(key: string, options?: any): void;
    stopForScene(key: string, options?: any): void;
    stop(key: string, options?: any): void;
}
