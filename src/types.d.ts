import type Electron from 'electron';

type showOpenDialogSync = typeof Electron.dialog.showOpenDialogSync;
type showSaveDialogSync = typeof Electron.dialog.showSaveDialogSync;
type showMessageBoxSync = typeof Electron.dialog.showMessageBoxSync;
type showErrorBox = typeof Electron.dialog.showErrorBox;

declare global {
    interface Exposer {
        'get'<K extends keyof typeof Electron>(key: K): Promise<Electron[K]>;
        'call'<K extends keyof typeof Electron>(key: K, ...args: Parameters<Electron[K]>): Promise<ReturnType<Electron[K]>>;
        'new'<K extends keyof typeof Electron>(key: K, ...args: ConstructorParameters<Electron[K]>): Promise<Electron[K]>;
        'static'<
            K extends keyof typeof Electron, T extends typeof Electron[K], M extends keyof T
        >(key: K, method: M, ...args: Parameters<T[M]>): Promise<ReturnType<T[M]>>;
    }

    interface App {
        async showOpenDialog(...args: Parameters<showOpenDialogSync>): Promise<ReturnType<showOpenDialogSync>>;
        async showSaveDialog(...args: Parameters<showSaveDialogSync>): Promise<ReturnType<showSaveDialogSync>>;
        async showMessageBox(...args: Parameters<showMessageBoxSync>): Promise<ReturnType<showMessageBoxSync>>;
        async showErrorBox(...args: Parameters<showErrorBox>): Promise<ReturnType<showErrorBox>>;
    }

    /** @custom Internal Electron API exposing functions. */
    var exposer: Exposer;

    /** @custom Misc APIs mostly for performing native application operations. */
    var app: App;
}

export {};
