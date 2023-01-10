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
import fetch from 'node-fetch';

// @ts-expect-error no-types-provided
import tachyon from 'tachyon';

import variants from './gamevariants.json' assert { type: 'json' };
// @ts-ignore external-import
import pkg from '../package.json' assert { type: 'json' };


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
            ipcMain.on("check-update", async (event) => {
                checkGithubUpdate();
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
            ipcMain.on('tachyon-init', async (event, rpxPath, patchPath, outPath) => {
                try {
                    console.log('Tachyon initialized from IPC');
                    if (outPath === rpxPath) {
                        return new Error('Input RPX path cannot be the same as the output RPX path.')
                    }
                    if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
                    let outPathNoExt = outPath.split('.').slice(0, -1).join('.');
                    await tachyon.patch(rpxPath, patchPath, outPathNoExt);
                    event.reply('tachyon-done', outPath);
                    return 1;
                } catch (error) {
                    // @ts-ignore
                    let handleErr = handleError(error);
                    return event.reply('tachyon-error', handleErr);
                }
            });

        });
        function handleError(err: Error) {
            console.log(err);
            let errorMessage = err.message;

            let step = 0;
            for (const variant of variants.ids) {
                if (errorMessage.includes(variant)) {
                    // @ts-ignore type-mismatch
                    errorMessage = errorMessage.replace(variant, variants.names[step]);
                    console.log('Checking for name match' + variants.names[step]);
                }
                step++;
            }
            let userInfo = `\n\nPlease join our discord for support: nsmbu.net/discord`;
            // @ts-ignore


            electron.dialog.showErrorBox('Something has gone catastrophically wrong!', errorMessage + userInfo);
            return(errorMessage);
        }

        async function checkGithubUpdate() {
            try {
                const response = await fetch('https://api.github.com/repos/Zenith-Team/Trailblazer/releases/latest');
                const data: any = await response.json();

                if (data.tag_name > pkg.version) {
                    let dialog = electron.dialog.showMessageBoxSync({
                        type: 'question',
                        buttons: ['Yes', 'No'],
                        title: 'Update available',
                        message: `A new version of Trailblazer is available (${pkg.version} → ${data.tag_name}) Would you like to download it?`,

                    })
                    if (dialog === 0) {
                        await electron.shell.openExternal(data.html_url);
                    }
                } else {
                    console.log('Up to date!' + `(${pkg.version} >= ${data.tag_name})`);
                }
            } catch (error) {
                // @ts-ignore
                handleError(error);
            }
        }
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
                devTools: true,
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
        this.window.loadFile( '../view/index.html').catch(() => {
            this.window?.loadFile( './view/index.html');
        });
    }

    protected window: Electron.BrowserWindow | null = null;
    protected readonly electron: typeof Electron;
}


