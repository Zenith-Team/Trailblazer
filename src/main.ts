/*
        (              (    (          (                 )       (
      ) )\ )    (      )\ ) )\ )   (   )\ )    (      ( /(       )\ )
` )  /((()/(    )\    (()/((()/( ( )\ (()/(    )\     )\()) (   (()/(
 ( )(_))/(_))((((_)(   /(_))/(_)))((_) /(_))((((_)(  ((_)\  )\   /(_))
(_(_())(_))   )\ _ )\ (_)) (_)) ((_)_ (_))   )\ _ )\  _((_)((_) (_))
|_   _|| _ \  (_)_\(_)|_ _|| |   | _ )| |    (_)_\(_)|_  / | __|| _ \
  | |  |   /   / _ \   | | | |__ | _ \| |__   / _ \   / /  | _| |   /
  |_|  |_|_\  /_/ \_\ |___||____||___/|____| /_/ \_\ /___| |___||_|_\

    Zenith team 2022
    Thanks Jh for Tachyon <3
 */
import type Electron from 'electron';

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// @ts-expect-error no-types-provided
import tachyon from 'tachyon';



export class App {
    constructor(electron: typeof Electron) {
        this.electron = electron;
        const { app, BrowserWindow, ipcMain } = this.electron;
        app.commandLine.appendSwitch('enable-features', 'GuestViewCrossProcessFrames');

        app.whenReady().then(() => {
            this.createMainWindow();
            app.on('activate', () => {
                if (!BrowserWindow.getAllWindows().length) this.createMainWindow();
            });
            ipcMain.handle('electron-get', (_event, key: keyof typeof Electron) => {
                return this.electron[key];
            });
            ipcMain.handle('electron-call', (_event, key: keyof typeof Electron, args: any[] = []) => {
                return (<any>this.electron[key])(...args);
            });
            ipcMain.handle('electron-new', (_event, key: keyof typeof Electron, args: any[] = []) => {
                return new (<any>this.electron[key])(...args);
            });
            ipcMain.handle('electron-static', (_event, key: keyof typeof Electron, method: string, args: any[] = []) => {
                return (<any>this.electron[key])[method](...args);
            });
            ipcMain.on('minimize-window', () => {
                this.window!.minimize();
            });
            ipcMain.on('close-window', () => {
                this.window!.close();
            });
            ipcMain.on('close', () => {
                app.relaunch();
                app.quit();
            });
            ipcMain.on('tachyon-init', async (e, r, p ,o) => {
                function testDone() {
                    if (fs.existsSync(o)) {
                        return e.reply('tachyon-done', o);
                    }
                    return;
                }
                try {
                    console.log('Tachyon initialized from IPC');
                    if (o === r) {
                        console.error('Input RPX path cannot be the same as the output RPX path.');
                        electron.dialog.showErrorBox('Something has gone catastrophically wrong!', "Input RPX path cannot be the same as the output RPX path.");
                        return e.reply('tachyon-error', 'Output path cannot be the same as the input path');
                    }
                    if (fs.existsSync(o)) {
                        await fs.unlinkSync(o)
                    }
                    let O = o.split('.').slice(0, -1).join('.');
                    await tachyon.patch(r, p, O);
                    setInterval(testDone, 1000);

                    return 1;
                } catch (err) {
                    let errorMessage: string = 'Please contact support.';
                    if (err instanceof Error) {
                        errorMessage = err.message;
                    }
                    console.log(errorMessage);
                    electron.dialog.showErrorBox('Something has gone catastrophically wrong!', errorMessage);
                    return e.reply('tachyon-error', errorMessage);
                }
            })
        });

        app.on('window-all-closed', app.quit);
    }

    createMainWindow() {
        const { BrowserWindow } = this.electron;
        this.window = new BrowserWindow({
            title: 'Trailblazer',
            icon: './asset/icon.png',
            backgroundColor: '#292929',
            width: 910, // 960, 540
            height: 490,
            center: true,
            fullscreen: false,
            fullscreenable: false,
            maximizable: false,
            resizable: false,
            darkTheme: true,
            show: false,
            frame: process.env.TRAILBLAZER_DEV !== undefined,
            webPreferences: {
                devTools: false,
                defaultEncoding: 'utf-8',
                disableHtmlFullscreenWindowResize: true,
                textAreasAreResizable: false,
                spellcheck: false,
                backgroundThrottling: false,
                contextIsolation: false,
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                nodeIntegrationInSubFrames: true,
                preload: path.join(path.dirname(fileURLToPath(import.meta.url)), 'preload.cjs')
            }
        });

        this.window.on('ready-to-show', this.window.show);
        this.window.loadFile( '../view/index.html').catch(e => {
            this.window?.loadFile( './view/index.html');
        });
    }

    protected window: Electron.BrowserWindow | null = null;
    protected readonly electron: typeof Electron;
}

