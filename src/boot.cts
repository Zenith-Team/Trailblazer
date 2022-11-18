(async () => new (await import('./main.js')).App(require('electron')!))();
