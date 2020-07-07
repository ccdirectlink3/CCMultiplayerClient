declare namespace simplify {
    function registerUpdate(func: (...args: any[]) => any): void;
    function loadScript(url: string): Promise<void>;
    function getMod(name: string): Mod;
}

declare namespace simplify.resources {
    function loadJSON(path: string, callback: (content: any) => void, errorCallback?: (error: any) => void): void;
}
