globalThis.Import = require;

const { ipcRenderer } = Import('electron');

globalThis.exposer = {
    get: (key) => ipcRenderer.invoke('electron-get', key),
    call: (key, ...args) => ipcRenderer.invoke('electron-call', key, args),
    new: (key, ...args) => ipcRenderer.invoke('electron-new', key, args),
    static: (key, method, ...args) => ipcRenderer.invoke('electron-static', key, method, args),
};

globalThis.app = {
    async showOpenDialog(...args) {
        return exposer.static('dialog', 'showOpenDialogSync', ...args);
    },
    async showSaveDialog(...args) {
        return exposer.static('dialog', 'showSaveDialogSync', ...args);
    },
    async showMessageBox(...args) {
        return exposer.static('dialog', 'showMessageBoxSync', ...args);
    },
    async showErrorBox(...args) {
        return exposer.static('dialog', 'showErrorBox', ...args);
    }
};
