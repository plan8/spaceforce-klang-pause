import { Player, SceneManager } from "@plan8/klang";

interface VOEvent {
  key: string;
  timeout: number;
}

export interface VOPartConfig {
  name: string;
  events: Array<VOEvent>
}
interface StopOptions {
  setCompleted?: boolean;
  stopImmediately?: boolean;
}
class VOPart  {
  private config: VOPartConfig;
  private timeoutId: number = 0;
  private endTimeoutId: number = 0;
  private sceneManager: SceneManager;
  private currentIndex: number = 0;
  private callback: Function | undefined;
  private currentKey: string | undefined;
  private timerPausedAt: number | null = null;
  private timerRemaining: number | null = null;
  private timeoutTargetTime: number | null = null;

  constructor(config: VOPartConfig, sceneManager: SceneManager, callback?: Function) {
    this.config = config;
    this.sceneManager = sceneManager;
    this.callback = callback;
  }

  public start() {
    this.triggerKey(this.currentIndex);
  }

  public getCurrentIndex() {
    return this.currentIndex;
  }

  public stop(options: StopOptions = { setCompleted: false, stopImmediately: true}) {
    clearTimeout(this.timeoutId);
    clearTimeout(this.endTimeoutId);

    if (options.stopImmediately) {
      this.config.events.forEach((event)=> {
        const instrument = this.sceneManager.getInstrument(`vo:${event.key}`) as Player;
        if (instrument && instrument.player.state !== 'stopped') {
          this.sceneManager.stop(`vo:${event.key}`);
        }
      });
    }

    if (this.currentKey) {
      this.callback && this.callback({key: this.currentKey, action: 'stop'});
    }

    if (options.setCompleted) {
      this.currentIndex = this.config.events.length;
    }
  }

  public reset() {
    this.currentIndex = 0;
  }

  public pauseCurrent() {
    const event = this.config.events[this.currentIndex - 1];

    console.log('pauseCurrent!', event);
    if (event && event.key) {
      this.sceneManager.pause(`vo:${event.key}`, { fadeTime: 0.1 });
    }
    // Pause the timer
    if (this.timeoutId) {
      this.timerPausedAt = Date.now();
      // Calculate remaining time
      this.timerRemaining = (this.timeoutTargetTime ?? 0) - this.timerPausedAt;
      clearTimeout(this.timeoutId);
      this.timeoutId = 0;
    }

   
    console.log('paused', event.key);

    
  }

  public resumeCurrent() {
    const event = this.config.events[this.currentIndex - 1];
    if (event) {
      this.sceneManager.resume(`vo:${event.key}`, { fadeTime: 0.1 });  
    }
    // Resume the timer
    if (this.timerRemaining && this.timerRemaining > 0) {
      this.timeoutId = setTimeout(() => {
        this.triggerKey(this.currentIndex, 0);
      }, this.timerRemaining);
      this.timeoutTargetTime = Date.now() + this.timerRemaining;
      this.timerRemaining = null;
    }
    console.log('resumed', event.key);
  }

  private triggerKey(index: number, delay: number = 0) {
    if (index < this.config.events.length) {
      const event = this.config.events[index];
      const instrument = this.sceneManager.getInstrument(`vo:${event.key}`);
      const duration = (instrument as Player)?.getDuration() || 0;

      // Set up the timer and track when it should fire
      this.timeoutId = setTimeout(() => {
        this.sceneManager.trigger(`vo:${event.key}`);
        this.currentKey = event.key;
        this.callback && this.callback({ key: event.key, action: "start" });

        this.endTimeoutId = setTimeout(() => {
          this.currentKey = "";
          this.callback && this.callback({ key: event.key, action: "stop" });
        }, duration * 1000 - 50);

        this.currentIndex = this.currentIndex + 1;
        this.triggerKey(this.currentIndex, duration);
      }, (event.timeout + delay) * 1000);

      // Track when the timer should fire
      this.timeoutTargetTime = Date.now() + (event.timeout + delay) * 1000;
    }
  }
}

export default VOPart;