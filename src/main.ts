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

import variants from './gamevariants.json' assert { type: 'json' };

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
            ipcMain.on('close', (_evt, noRelaunch?: boolean) => {
                if (!noRelaunch) app.relaunch();
                app.quit();
            });
            ipcMain.on('tachyon-init', async (event, rpxPath, patchPath, outPath, hashCheck?: boolean) => {
                try {
                    console.log('Tachyon initialized from IPC');
                    if (outPath === rpxPath) {
                        console.error('Input RPX path cannot be the same as the output RPX path.');
                        electron.dialog.showErrorBox('Something has gone catastrophically wrong!', "Input RPX path cannot be the same as the output RPX path.");
                        return event.reply('tachyon-error', 'Output path cannot be the same as the input path');
                    }
                    if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
                    let outPathNoExt = outPath.split('.').slice(0, -1).join('.');
                    await tachyon.patch(rpxPath, patchPath, outPathNoExt);
                    event.reply('tachyon-done', outPath);
                    return 1;
                } catch (err) {
                    let errorMessage: string = 'Please contact support linked on the Trailblazer website.';
                    if (err instanceof Error) {
                        errorMessage = err.message;
                    }
                    console.log(errorMessage);
                    let step = 0;
                    for (const variant of variants.ids) {
                        if (errorMessage.includes(variant)) {
                            // @ts-ignore type-mismatch
                            errorMessage = errorMessage.replace(variant, variants.names[step]);
                            return step++;
                        }

                    }
                    let userInfo = `\n\nPlease join our discord for support: nsmbu.net/discord`;
                    electron.dialog.showErrorBox('Something has gone catastrophically wrong!', errorMessage + userInfo);
                    return event.reply('tachyon-error', errorMessage);
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

