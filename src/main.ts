// @ts-ignore

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

import variants from './gamevariants.json' with { type: 'json' };
// @ts-ignore external-import
import pkg from '../package.json' with { type: 'json' };


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
            ipcMain.on('close', () => {
                app.quit();
            });
            ipcMain.on('tachyon-init', async (event, rpxPath, patchPath, outPath) => {
                try {
                    console.log('Tachyon initialized from IPC');
                    if (outPath === rpxPath) {
                        let str = 'Output path cannot be the same as the input path.';
                        handleError(new Error(str));
                        return event.reply('tachyon-error', str)
                    }
                    if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
                    let outPathNoExt = outPath.split('.').slice(0, -1).join('.');

                    await spawnTachyonPatch(rpxPath, patchPath, outPathNoExt, event);

                    event.reply('tachyon-done', outPath);
                    return 1;
                } catch (error: any) {
                    let handleErr = handleError(error);
                    return event.reply('tachyon-error', handleErr);
                }
            });

            async function spawnTachyonPatch(rpxPath: string, patchPath: string, outPath: string, event: any) {
                const { spawn } = await import('child_process');
                
                // Resolve the path to the tachyon CLI script
                let cliPath = path.join(app.getAppPath(), 'node_modules', 'tachyon', 'dist', 'cli.js');
                
                // If we are in a packaged app, the script must be executed from the unpacked directory
                cliPath = cliPath.replace('app.asar', 'app.asar.unpacked');
                
                const args = [cliPath, 'patch', rpxPath, patchPath, '--allow-hash-mismatch', '-o', outPath];

                return new Promise((resolve, reject) => {
                    // Run the CLI script using the bundled Node (Electron binary) to ensure cross-platform reliability
                    const proc = spawn(process.execPath, args, {
                        env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
                    });
                    let errorOutput = '';

                    proc.stdout.on('data', (data) => {
                        const str = data.toString();
                        event.sender.send('tachyon-log', str);
                    });

                    proc.stderr.on('data', (data) => {
                        const str = data.toString();
                        errorOutput += str;
                        event.sender.send('tachyon-log', str);
                    });

                    proc.on('close', (code) => {
                        if (code === 0) resolve(true);
                        else reject(new Error(`Tachyon failed (code ${code}): ${errorOutput}`));
                    });
                });
            }
        });
        const handleError = (err: Error, event?: any) => {
            console.log(err);
            let errorMessage = err.message + "\n" + err.stack;
 
            let step = 0;
            for (const variant of variants.ids) {
                if (errorMessage.includes(variant)) {
                    // @ts-ignore
                    errorMessage = errorMessage.replace(variant, variants.names[step]);
                    console.log('Checking for name match' + variants.names[step]);
                }
                step++;
            }
            let userInfo = `\n\nPlease join our discord for support: go.nsmbu.net/discord`;
 
            if (this.window && !this.window.isDestroyed()) {
                this.window.webContents.send('system-error', errorMessage + userInfo);
            } else {
                electron.dialog.showErrorBox('Something has gone wrong...', errorMessage + userInfo);
            }
            return(errorMessage);
        };
 
        const checkGithubUpdate = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/Zenith-Team/Trailblazer/releases/latest');
                const data: any = await response.json();
 
                if (data.tag_name > pkg.version) {
                    if (this.window && !this.window.isDestroyed()) {
                        this.window.webContents.send('update-available', data.tag_name, data.html_url);
                    } else {
                        let dialog = electron.dialog.showMessageBoxSync({
                            type: 'question',
                            buttons: ['Yes', 'No'],
                            title: 'Update available',
                            message: `A new version of Trailblazer is available (${pkg.version} → ${data.tag_name}) Would you like to download it?`,
                        })
                        if (dialog === 0) {
                            await electron.shell.openExternal(data.html_url);
                        } else return;
                    }
                } else {
                    return console.log('Up to date!' + `(${pkg.version} >= ${data.tag_name})`);
                }
            } catch (error) {
                // @ts-ignore
                handleError(error);
            }
        };
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
                devTools: process.env.TRAILBLAZER_DEV !== undefined,
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

        this.window.on('ready-to-show', () => {
            this.window?.show();
        });
        this.window.loadFile( '../view/index.html').catch(() => {
            this.window?.loadFile( './view/index.html');
        });
    }

    protected window: Electron.BrowserWindow | null = null;
    protected readonly electron: typeof Electron;
}


