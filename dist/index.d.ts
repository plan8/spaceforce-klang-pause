import { InteractiveLayerBase } from "@plan8/klang";
interface IGuardian {
    name: string;
    filters: string[];
    location: string;
    message: ({
        pause: number;
        type: string;
        content: string;
    } | {
        content: string;
        pause?: undefined;
        type?: undefined;
    })[];
    role: string;
    thumbnail: any;
}
declare class SpaceForceKlang extends InteractiveLayerBase {
    constructor();
    initHomePage(): Promise<void[]>;
    private setupTextScramble;
    private getVoice;
    changeScene(sceneName: string | number): any;
    setIsMapOpen(isOpen: boolean): void;
    textScramble(text: string, delay?: number): void;
    pauseAllCurrentlyPlaying(): void;
    resumeAllCurrentlyPlaying(): void;
    private stopText;
    stopTextScramble(text?: string): void;
    handleVoice(guardian: IGuardian, index: number): void;
    setVOCallback(callback: Function): void;
    setVideoPlaying(shouldMute: boolean): void;
    startTextRolling(): void;
    stop(key: string, options?: any): void;
    stopTextRolling(): void;
    setCapabilitiesScrollValue(scrollValue: number): void;
    setCapabilitiesStage(value: number): void;
    onPreloaderChange(done: boolean): void;
    showGuardians(): void;
    hideGuardians(): void;
}
export default SpaceForceKlang;
