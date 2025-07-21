declare const config: {
    scenes: {
        generic: {
            name: string;
            sounds: ({
                name: string;
                sound: string[];
                bus: string;
                type: string;
                gain?: undefined;
                loop?: undefined;
                loopEnd?: undefined;
            } | {
                name: string;
                sound: string;
                bus: string;
                type?: undefined;
                gain?: undefined;
                loop?: undefined;
                loopEnd?: undefined;
            } | {
                name: string;
                sound: string;
                bus: string;
                gain: number;
                type?: undefined;
                loop?: undefined;
                loopEnd?: undefined;
            } | {
                name: string;
                sound: string;
                bus: string;
                loop: boolean;
                type?: undefined;
                gain?: undefined;
                loopEnd?: undefined;
            } | {
                name: string;
                sound: string;
                bus: string;
                loop: boolean;
                loopEnd: number;
                type?: undefined;
                gain?: undefined;
            } | {
                name: string;
                sound: string[];
                type: string;
                gain: number;
                bus: string;
                loop?: undefined;
                loopEnd?: undefined;
            })[];
        };
        main: {
            name: string;
            sounds: ({
                name: string;
                sound: string;
                bus: string;
                loop?: undefined;
                loopEnd?: undefined;
                gain?: undefined;
            } | {
                name: string;
                sound: string;
                bus: string;
                loop: boolean;
                loopEnd: number;
                gain?: undefined;
            } | {
                name: string;
                sound: string;
                bus: string;
                gain: number;
                loop?: undefined;
                loopEnd?: undefined;
            } | {
                name: string;
                sound: string;
                gain: number;
                bus: string;
                loop: boolean;
                loopEnd?: undefined;
            } | {
                name: string;
                sound: string;
                bus: string;
                loop: boolean;
                loopEnd?: undefined;
                gain?: undefined;
            })[];
            bus: string;
        };
        vo: {
            name: string;
            sounds: {
                name: string;
                sound: string;
            }[];
            bus: string;
        };
    };
    sources: {
        name: string;
    }[];
    busses: {
        name: string;
        parent: string;
        gain: number;
    }[];
    basePath: string;
};
export default config;
