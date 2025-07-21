import { SceneManager, utils, createFSM } from "@plan8/klang";

export default abstract class InteractiveLayerBase {
  initializingElement: HTMLElement;
  onInit?: () => Promise<void>;
  appFSM?: unknown;
  sceneManager: SceneManager;

  constructor({ initializingElement, onInit, sceneManager, appFSM }) {
    this.initializingElement = initializingElement || window;
    this.init = this.init.bind(this);
    this.onInit = onInit;
    this.sceneManager = sceneManager;
    this.appFSM = appFSM;
  }

  public async init() {
    if (this.sceneManager) {
      try {
 

        this.initializingElement.removeEventListener("touchend", this.init);
        this.initializingElement.removeEventListener("mousedown", this.init);

        utils.setMuteOnBlur("out", 0.3, this.sceneManager);
      } catch (e) {
        console.warn(e, "could not initialize audio");
      }
    }
  }

  // public method for enabling audio
  public async initAudio() {
    if (!this.sceneManager.audioIsInitialized) {
      // throws a warning if you haven't enabled previously
 

      this.initializingElement.addEventListener("touchend", this.init);
      this.initializingElement.addEventListener("mousedown", this.init);
    }

    // load all scenes. return promise when ready
    this.onInit && (await this.onInit());
  }

  public setMute(shouldMute: boolean) {
    this.sceneManager.setBusMute("master", shouldMute);
  }

  public setBlurMute(shouldMute: boolean) {
    this.sceneManager.setBusMute("out", shouldMute);
  }

  public disableBlurMute(disabled: boolean) {
    this.sceneManager.disableBlur = disabled;
  }

  public changeScene(sceneName: string | number) {
    // @ts-ignore
    this.appFSM?.transition(sceneName);
  }

  // basic pass through
  public trigger(key: string, options?: any) {
    if (this.sceneManager.audioIsInitialized) {
      if (!key.match(":")) {
        this.sceneManager.triggerForScene(key, options);
        return; // @scazan maybe we should return something useful here
      }

      this.sceneManager.trigger(key, options);
    }
  }

  public triggerForScene(key: string, options?: any) {
    if (this.sceneManager.audioIsInitialized) {
      this.sceneManager.triggerForScene(key, options);
    }
  }

  public stopForScene(key: string, options?: any) {
    if (this.sceneManager.audioIsInitialized) {
      this.sceneManager.stopForScene(key, options);
    }
  }

  public stop(key: string, options?: any) {
    if (this.sceneManager.audioIsInitialized) {
      this.sceneManager.stop(key, options);
    }
  }
}
