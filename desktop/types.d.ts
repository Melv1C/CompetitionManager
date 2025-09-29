interface Window {
    electron: {
        getResults: () => Promise<any>;
        subscribeToResults: (callback: (result: number) => void) => void;
    };
}

type EventPayloadMapping = {
    getResults: Promise<string[]>;
    result: number;
};