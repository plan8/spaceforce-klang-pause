// @ts-ignore
window.TONE_SILENCE_LOGGING = true;

import {
  SceneManager,
  utils,
  createFSM,
  Instrument,
  Player,InteractiveLayerBase
} from "@plan8/klang";
import config from "./config/config";
import voConfig from "./config/voConfig";
//import InteractiveLayerBase from "./InteractiveLayerBase";
import VOPart from "./VOPart";

//@ts-ignore
const sceneManager = new SceneManager(config);
const scrambleVoices: Array<IVoice> = [];
const excludeTexts = ["Incoming signal...", "close"];
const transitionFadeTime = 0.5;
const voParts = [];
const rocketLaunchScenes = [
  "loader",
  "launchComplex",
  "launchSequence",
  "deploySatellite",
  "deploySatelliteSequence",
  "exploreSatellite",
];
let mapIsOpen = false;
let isPreloaderDone = true;
let voCallback: Function;
let currentCapabilitiesStage: number = 0;
const oneshotsHasPlayed = {
  "generic:rocketOneshot": false,
  "generic:satelliteOneshot": false,
  "generic:spacejunkOneshot": false,
  "generic:transmissionOneshot": false,
};
interface IVoice {
  text: string;
  time: number;
  instrument: Instrument;
}

interface IGuardian {
  name: string;
  filters: string[];
  location: string;
  message: (
    | {
        pause: number;
        type: string;
        content: string;
      }
    | {
        content: string;
        pause?: undefined;
        type?: undefined;
      }
  )[];
  role: string;
  thumbnail: any;
}

const onVOPlay = (key: string) => {
  voCallback && voCallback(key);
};

voConfig.parts.forEach((config) => {
  const voPart = new VOPart(config, sceneManager, onVOPlay);
  voParts[config.name] = voPart;
});

const stopAllVO = () => {
  console.log('stopAllVO')
  Object.values(voParts).forEach((voPart: VOPart) => {
    voPart.stop();
  });
};

// Main app state
const appFSM = createFSM({
  initialState: "loading",
  states: {
    loader: {
      actions: {
        onEnter: () => {
          // sceneManager.trigger("main:musicMenu", {
          //   fadeIn: transitionFadeTime,
          // });
          // sceneManager.trigger("main:ambMenu", { fadeIn: transitionFadeTime });
        },
        onExit: () => {
          // sceneManager.fadeOut("main:musicMenu", {
          //   fadeTime: transitionFadeTime,
          // });
          // sceneManager.fadeOut("main:ambMenu", { fadeTime: transitionFadeTime });
        },
      },
    },

    launchComplex: {
      actions: {
        onEnter: () => {
          sceneManager.trigger("main:ambMap", { fadeIn: transitionFadeTime }); //stop this somewhere?
          sceneManager.trigger("main:ambLaunchPad1", {
            fadeIn: transitionFadeTime,
          });
          sceneManager.trigger("main:ambLaunchPad2", {
            fadeIn: transitionFadeTime,
          });
          voParts["launchPadIdle"].stop();
          voParts["launchPadIdleExtra"].stop();
          voParts["launchPad"].start();
        },
        onExit: () => {
          sceneManager.fadeOut("main:ambLaunchPad1", {
            fadeTime: transitionFadeTime,
          });
          sceneManager.fadeOut("main:ambLaunchPad2", {
            fadeTime: transitionFadeTime,
          });
          voParts["launchPad"].stop();
          sceneManager.stop("generic:textRolling");
        },
      },
    },

    launchSequence: {
      actions: {
        onEnter: () => {
          sceneManager.trigger("main:rocketLaunch");
          voParts["launchPadIdle"].stop();
          voParts["launchPadIdleExtra"].stop();
          voParts["launchSequence"].reset();
          voParts["launchSequence"].start();
          voParts["satelliteDeployed"].reset();
          sceneManager.setBusVolume("vo", 1.5, 0.5);
        },
        onExit: (nextState) => {
          sceneManager.fadeOut("main:rocketLaunch", {
            fadeTime: transitionFadeTime,
          });
          const stopImmediately = nextState !== "deploySatellite";
          voParts["launchSequence"].stop({ stopImmediately });

          sceneManager.setBusVolume("vo", 1.0, 0.1);
          sceneManager.stop("generic:textRolling");
        },
      },
    },

    deploySatellite: {
      actions: {
        onEnter: (previousState) => {
          let stopImmediately = false;

          if (previousState === "launchSequence") {
            if (voParts["launchSequence"].getCurrentIndex() < 5) {
              stopImmediately = true;
            }
          }
          voParts["launchSequence"].stop({ stopImmediately });
          voParts["launchSequence"].reset();
          sceneManager.trigger("main:rocketFlight", {
            fadeIn: transitionFadeTime,
          });
        },
        onExit: () => {
          sceneManager.fadeOut("main:rocketFlight", {
            fadeTime: transitionFadeTime,
          });
        },
      },
    },

    deploySatelliteSequence: {
      actions: {
        onEnter: () => {
          sceneManager.trigger("main:rocketDeploy");
          sceneManager.trigger("main:ambSpace", {
            fadeIn: transitionFadeTime,
          });
          voParts["launchSequence"].stop();
          voParts["satelliteDeployed"].start();
        },
        onExit: (nextState) => {
          sceneManager.fadeOut("main:rocketDeploy", {
            fadeTime: transitionFadeTime,
          });
          sceneManager.fadeOut("main:ambSpace", {
            fadeTime: transitionFadeTime,
          });
          const stopImmediately = nextState !== "exploreSatellite";
          voParts["satelliteDeployed"].stop({ stopImmediately });
        },
      },
    },

    exploreSatellite: {
      actions: {
        onEnter: () => {
          sceneManager.trigger("main:ambSpace", { fadeIn: transitionFadeTime });
        },
        onExit: () => {
          sceneManager.fadeOut("main:ambSpace", {
            fadeTime: transitionFadeTime,
          });
        },
      },
    },

    becomeAGuardian: {
      actions: {
        onEnter: (previousState) => {
          sceneManager.trigger("generic:musicMenu", {
            fadeIn: transitionFadeTime,
          });
          sceneManager.trigger("generic:ambMenu", {
            fadeIn: transitionFadeTime,
          });

          if (
            previousState === "launchComplex" ||
            previousState === "launchSequence"
          ) {
            sceneManager.fadeOut("main:ambLaunchPad1", {
              fadeTime: transitionFadeTime,
            });
            sceneManager.fadeOut("main:ambLaunchPad2", {
              fadeTime: transitionFadeTime,
            });
          }
          if (
            previousState === "deploySatelliteSequence" ||
            previousState === "exploreSatellite"
          ) {
            sceneManager.fadeOut("main:ambSpace", {
              fadeTime: transitionFadeTime,
            });
            sceneManager.fadeOut("main:rocketFlight", {
              fadeTime: transitionFadeTime,
            });
          }
        },
        onExit: () => {
          sceneManager.fadeOut("generic:musicMenu", {
            fadeTime: transitionFadeTime,
          });
          sceneManager.fadeOut("generic:ambMenu", {
            fadeTime: transitionFadeTime,
          });
        },
      },
    },

    menu: {
      actions: {
        onEnter: (previousState) => {
          sceneManager.trigger("generic:musicMenu", {
            fadeIn: transitionFadeTime,
          });

          sceneManager.trigger("generic:ambMenu", {
            fadeIn: transitionFadeTime,
          });

          if (
            previousState === "launchComplex" ||
            previousState === "launchSequence"
          ) {
            sceneManager.fadeOut("main:ambLaunchPad1", {
              fadeTime: transitionFadeTime,
            });
            sceneManager.fadeOut("main:ambLaunchPad2", {
              fadeTime: transitionFadeTime,
            });
          }
          if (
            previousState === "deploySatelliteSequence" ||
            previousState === "exploreSatellite"
          ) {
            sceneManager.fadeOut("main:ambSpace", {
              fadeTime: transitionFadeTime,
            });
            sceneManager.fadeOut("main:rocketFlight", {
              fadeTime: transitionFadeTime,
            });
          }
        },
        onExit: () => {
          sceneManager.fadeOut("generic:musicMenu", {
            fadeTime: transitionFadeTime,
          });
          sceneManager.fadeOut("generic:ambMenu", {
            fadeTime: transitionFadeTime,
          });
        },
      },
    },

    silent: {
      actions: {
        onEnter: () => {},
        onExit: () => {},
      },
    },
  },
});

class SpaceForceKlang extends InteractiveLayerBase {
 
  constructor() {
    
    super({
      initializingElement: window,
      onInit: () => {
        console.log('onInit')
        this.disableBlurMute(false);
      
        
        const promises = [sceneManager.loadScene("generic")];

        return Promise.all(promises).then(() => {
          this.setupTextScramble();
        });
      },
      appFSM,
      sceneManager,
    });


    
 
  }

  public initHomePage() {
    const promises = [
      sceneManager.loadScene("main", true),
      sceneManager.loadScene("vo"),
    ];
    sceneManager.getBus("map").setGain(0, 1);

    return Promise.all(promises);
  }

  private async setupTextScramble() {
    scrambleVoices.push(
      {
        text: "",
        time: 0,
        instrument: sceneManager.getInstrument("generic:textAppear1"),
      },
      {
        text: "",
        time: 0,
        instrument: sceneManager.getInstrument("generic:textAppear2"),
      }
      // {
      //   text: "",
      //   time: 0,
      //   instrument: sceneManager.getInstrument("main:textAppear3"),
      // },
      // {
      //   text: "",
      //   time: 0,
      //   instrument: sceneManager.getInstrument("main:textAppear4"),
      // }
    );
  }

  private getVoice(text: string, mostRecent: boolean = false): IVoice {
    let returnVoice: IVoice | undefined = scrambleVoices.find(
      (voice) => voice.text === text
    );
    if (!returnVoice) {
      //@TODO @scott I need help with this reduce...
      let accumulator: IVoice = scrambleVoices[0];

      scrambleVoices.reduce(function (prev: IVoice, curr: IVoice) {
        let voice = prev.time < curr.time ? prev : curr;
        if (mostRecent) {
          voice = prev.time > curr.time ? prev : curr;
        }
        return voice;
      }, accumulator);
      returnVoice = accumulator;
    }
    return returnVoice as IVoice;
  }

  public changeScene(sceneName: string | number) {
    // @ts-ignore
    this.appFSM?.transition(sceneName);
    // @ts-ignore
    return this.appFSM.stash || Promise.resolve();
  }

  public setIsMapOpen(isOpen: boolean) {
    mapIsOpen = isOpen;
    sceneManager.getBus("map").setGain(isOpen ? 1 : 0, 1);
    sceneManager.getBus("mainBus").setGain(isOpen ? 0 : 1, 1);
    this.trigger(isOpen ? "mapIn" : "mapOut");
  }

  public textScramble(text: string, delay?: number) {
    text = text || "";
    if (!excludeTexts.includes(text) && this.sceneManager.audioIsInitialized) {
      const voice = this.getVoice(text);
      if (voice) {
        voice.text = text;
        voice.time = SceneManager.now() + (delay || 0);
        this.stopText(voice);
        if (isPreloaderDone) {
          voice.instrument.play({ options: { when: delay || 0 } });
        }
      }
    }
  }

  public pauseAllCurrentlyPlaying() {
  
    //sceneManager.pause("main:rocketLaunch", { fadeTime: 0.5 });
  sceneManager.pauseAllCurrentlyPlaying({fadeTime: 0.5 })
    voParts['launchSequence'].pauseCurrent()
  }

  public resumeAllCurrentlyPlaying() {
    //sceneManager.resume("main:rocketLaunch", { fadeTime: 0.5 });
    sceneManager.resumeAllPlaying({fadeTime: 0.5 })
    voParts['launchSequence'].resumeCurrent()
  }

  private stopText(voice: IVoice | undefined) {
    if (voice) {
      voice.instrument.fadeOut(0, 0, () => {
        voice.instrument.stop({});
      });
    }
  }

  public stopTextScramble(text?: string) {
    text = text || "";
    if (!excludeTexts.includes(text) && this.sceneManager.audioIsInitialized) {
      let voice;
      if (text) {
        voice = scrambleVoices.find((voice) => voice.text === text);
      } else {
        voice = this.getVoice("", true);
      }
      this.stopText(voice);
    }
  }

  public handleVoice(guardian: IGuardian, index: number) {
    const key = `vo:${guardian.name}_${index}`
      .replace(/\s+/g, "_")
      .replace(/\.+/g, "")
      .toLowerCase();
    this.trigger(key);
  }

  public setVOCallback(callback: Function) {
    voCallback = callback;
  }

  public setVideoPlaying(shouldMute: boolean) {
    this.sceneManager.setBusMute("video", shouldMute);
  }

  public startTextRolling() {
    //@ts-ignore
    if (rocketLaunchScenes.includes(this.appFSM?.value)) {
      this.trigger("generic:textRolling");
    }
  }

  public stop(key: string, options?: any) {
    if (this.sceneManager.audioIsInitialized) {
      this.sceneManager.stop(key, options);
    }
  }

  public stopTextRolling() {
    this.stop("generic:textRolling");
  }

  public setCapabilitiesScrollValue(scrollValue: number) {
    switch (currentCapabilitiesStage) {
      case 0:
        if (scrollValue > 800 && scrollValue < 1700) {
          const key = "generic:spacejunkOneshot";
          const instrument = this.sceneManager.getInstrument(key) as Player;
          if (
            instrument?.player?.state === "stopped" &&
            !oneshotsHasPlayed[key]
          ) {
            this.trigger(key);
            oneshotsHasPlayed[key] = true;
          }
        } else if (scrollValue > 1700) {
          const key = "generic:satelliteOneshot";
          const instrument = this.sceneManager.getInstrument(key) as Player;
          if (
            instrument?.player?.state === "stopped" &&
            !oneshotsHasPlayed[key]
          ) {
            this.trigger(key);
            oneshotsHasPlayed[key] = true;
          }
        }
        break;
      case 1:
        if (scrollValue > 500) {
          const key = "generic:transmissionOneshot";
          const instrument = this.sceneManager.getInstrument(key) as Player;
          if (
            instrument?.player?.state === "stopped" &&
            !oneshotsHasPlayed[key]
          ) {
            this.trigger(key);
            oneshotsHasPlayed[key] = true;
          }
        }
        break;
      case 2:
        if (scrollValue > 500) {
          const key = "generic:rocketOneshot";
          const instrument = this.sceneManager.getInstrument(key) as Player;
          if (
            instrument?.player?.state === "stopped" &&
            !oneshotsHasPlayed[key]
          ) {
            this.trigger(key);
            oneshotsHasPlayed[key] = true;
          }
        }
        break;
    }
  }

  public setCapabilitiesStage(value: number) {
    currentCapabilitiesStage = value;
  }

  public onPreloaderChange(done: boolean) {
    isPreloaderDone = done;

    if (done) {
      //reset oneshots
      for (const [key, value] of Object.entries(oneshotsHasPlayed)) {
        oneshotsHasPlayed[key] = false;
      }
    }
  }

  public showGuardians() {
    sceneManager.setBusVolume("launchScene", 0.1, 0.5);
  }

  public hideGuardians() {
    sceneManager.setBusVolume("launchScene", 1, 0.5);
  }

  
}

export default SpaceForceKlang;
