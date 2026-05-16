const { ipcRenderer } = Import('electron');
const fs = Import('fs');
const path = Import('path');

const pkg = Import(path.join(__dirname, '..', 'package.json') as `${string}.json`)!;

let patchFile: string = '';
let rpxFile: string = '';
let patchSelected: boolean = false;
let rpxSelected: boolean = false;
let outPath: any = '';

document.getElementById('txt-typf')!.style.display = 'none';
document.getElementById('btn-change-typf')!.style.display = 'none';

document.getElementById('txt-rpx')!.style.display = 'none';
document.getElementById('btn-change-rpx')!.style.display = 'none';

ipcRenderer.send('check-update');

let txt: HTMLElement = document.getElementById('doneTxt')!;

const appContainer = document.getElementById('app')!;

const spinContainer = document.getElementById("container")!;

function rpx(file: string[] | undefined) {
    if (!file) return console.log('No file selected');

    rpxFile = file[0]!;

    document.getElementById('btn-rpx')!.style.display = 'none';
    const text: HTMLElement = document.getElementById('txt-rpx')!;

    text.style.display = 'block';

    text.className = 'txt';

    if (!fs.existsSync(rpxFile)) {
        text.innerText = 'File not found';
        return;
    }

    text.innerText = path.basename(rpxFile);


    document.getElementById('btn-change-rpx')!.style.display = 'block';
    rpxSelected = true;
    if (patchSelected && rpxSelected) {
        return patchBtn();
    }
}
const getRpx = async () => {
    const file = await app.showOpenDialog({
        title: 'Select an RPX file',
        buttonLabel: 'Select file',
        properties: ['openFile'],
        filters: [
            { name: 'Wii U Executable', extensions: ['rpx'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    rpx (file);
}
function typf(file: string[]) {
    document.getElementById('doneTxt')!.style.display = 'none';
    // console.log(file);
    if (!file) {
        console.log('No file selected');
        return;
    }
    patchFile = file[0]!;
    document.getElementById('btn-typf')!.style.display = 'none';
    let text: HTMLElement = document.getElementById('txt-typf')!;
    text.style.display = 'block';

    if (!fs.existsSync(patchFile)) {
        text.innerText = 'File not found';
        return;
    }

    text.innerText = path.basename(patchFile);
    document.getElementById('btn-change-typf')!.style.display = 'block';

    const rpxbtn: HTMLElement = document.getElementById('btn-rpx')!;

    rpxbtn.className = 'btn';
    rpxbtn.onclick = triggerRpxSelect; // Use .onclick to ensure only one listener

    if (patchSelected) {
        return;
    }

    patchSelected = true;

    if (patchSelected && rpxSelected) {
        return patchBtn();
    }


}
const getTypf = async () => {
    const file = await app.showOpenDialog({
        title: 'Select a Tachyon patch file or bundle',
        buttonLabel: 'Select file',
        properties: ['openFile'],
        filters: [
            { name: 'Tachyon patch files', extensions: ['typf', 'typfb'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    typf (file!);
}

function resetAll() {
    patchFile = '';
    rpxFile = '';

    patchSelected = false;
    rpxSelected = false;

    // Reset UI visibility
    document.getElementById('txt-typf')!.style.display = 'none';
    document.getElementById('btn-change-typf')!.style.display = 'none';

    document.getElementById('txt-rpx')!.style.display = 'none';
    document.getElementById('btn-change-rpx')!.style.display = 'none';

    document.getElementById('btn-rpx')!.style.display = 'block';
    document.getElementById('btn-typf')!.style.display = 'block';
    
    document.getElementById('btn-rpx')!.className = 'btndeactive';
    document.getElementById('btn-rpx')!.onclick = null; // Correct reset
    
    document.getElementById('btn-patch')!.className = 'btndeactive';
    
    txt.style.display = 'none';
    txt.innerText = '';
    
    // Restore footer and info button
    document.getElementById("version")!.style.display = "block";
    document.getElementById("btn-info")!.style.display = "block";
}

function showModal(options: { 
    title: string, 
    textContent?: string, 
    showLog?: boolean, 
    showCancel?: boolean, 
    cancelText?: string,
    actionText?: string, 
    cancelCallback?: () => void,
    actionCallback?: () => void,
    forceX?: boolean // Specifically for STOP! modal or info popups
}) {
    const overlay = document.getElementById('modal-overlay')!;
    const title = document.getElementById('modal-title')!;
    const reqSection = document.getElementById('modal-requirements')!;
    const supportSection = document.getElementById('modal-support')!;
    const infoSection = document.getElementById('modal-info-text')!;
    const logSection = document.getElementById('modal-log-view')!;
    const actionBtn = document.getElementById('modal-action-btn') as HTMLButtonElement;
    const cancelBtn = document.getElementById('modal-cancel-btn') as HTMLButtonElement;
    const closeBtn = document.getElementById('modal-close') as HTMLButtonElement;

    // Reset visibility
    overlay.classList.remove('hidden');
    appContainer.classList.add('blurred');
    
    reqSection.classList.add('hidden');
    supportSection.classList.add('hidden');
    infoSection.classList.add('hidden');
    
    logSection.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    closeBtn.classList.add('hidden');
    
    title.innerText = options.title;

    // Triage content logic: Requirements list vs. Dynamic Message
    if (options.title === 'STOP!') {
        reqSection.classList.remove('hidden');
        supportSection.classList.remove('hidden');
    } else if (options.title === 'Error') {
        supportSection.classList.remove('hidden');
        if (options.textContent) {
            infoSection.classList.remove('hidden');
            infoSection.innerHTML = `<p>${options.textContent}</p>`;
        }
    } else if (options.textContent) {
        infoSection.classList.remove('hidden');
        infoSection.innerHTML = `<p>${options.textContent}</p>`;
    }

    if (options.showLog) {
        logSection.classList.remove('hidden');
        // logs are populated manually before calling showModal
    }

    if (options.showCancel) {
        cancelBtn.classList.remove('hidden');
        cancelBtn.innerText = options.cancelText || 'Cancel';
    }

    if (options.forceX) {
        closeBtn.classList.remove('hidden');
        // If forceX is on, we hide the Cancel button to avoid clutter
        cancelBtn.classList.add('hidden');
    }

    actionBtn.innerText = options.actionText || 'OK';
    actionBtn.disabled = false;
    
    // Clear and re-add listeners
    const newActionBtn = actionBtn.cloneNode(true) as HTMLButtonElement;
    actionBtn.parentNode!.replaceChild(newActionBtn, actionBtn);
    
    newActionBtn.onclick = () => {
        if (options.actionCallback) options.actionCallback();
        else hideModal();
    };

    const newCancelBtn = cancelBtn.cloneNode(true) as HTMLButtonElement;
    cancelBtn.parentNode!.replaceChild(newCancelBtn, cancelBtn);
    newCancelBtn.onclick = () => {
        if (options.cancelCallback) options.cancelCallback();
        else hideModal();
    };

    const newCloseBtn = closeBtn.cloneNode(true) as HTMLButtonElement;
    closeBtn.parentNode!.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.onclick = () => {
        if (options.cancelCallback) options.cancelCallback();
        else hideModal();
    };
}

function triggerRpxSelect() {
    showModal({
        title: 'STOP!',
        forceX: true, // Show X in corner
        actionText: 'OK',
        actionCallback: () => {
            hideModal();
            getRpx();
        },
        cancelCallback: () => {
            hideModal();
            // X acts as Cancel/Return
        }
    });
}

function hideModal() {
    const overlay = document.getElementById('modal-overlay')!;
    overlay.classList.add('hidden');
    appContainer.classList.remove('blurred');
}

function patchBtn() {
    const btn: HTMLElement = document.getElementById('btn-patch')!;
    btn.className = 'btn'; // Visual activation
}

// Global live log content variable during the session
let sessionLogs = '';

// Main Patch Logic (One-time listener setup)
document.getElementById('btn-patch')!.addEventListener('click', async () => {
    const btn = document.getElementById('btn-patch')!;
    if (btn.className === 'btndeactive') return;
    
    outPath = await app.showSaveDialog({
        title: 'Select output RPX location',
        buttonLabel: 'Save',
        defaultPath: path.join(path.dirname(patchFile), path.basename(patchFile, '.rpx') + `.${'custom'}.rpx`),
        properties: ['createDirectory'],
        filters: [
            { name: 'Wii U Executable', extensions: ['rpx'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    if (!outPath) return;

    // Reset session logs
    sessionLogs = '';
    const liveLogView = document.getElementById('live-log-view')!;
    const liveLogContent = document.getElementById('live-log-content')!;
    liveLogView.classList.remove('hidden');
    liveLogContent.innerText = '';
    
    spinContainer.style.display = "inline-block";
    const footer = document.getElementById("version")!;
    const infobtn = document.getElementById("btn-info")!;
    document.body.style.pointerEvents = "none";
    footer.style.display = "none"; infobtn.style.display = "none";

    appContainer.classList.add('blurred'); // Blur main app during patch
    
    btn.className = 'btndeactive';
    
    const logHandler = (e: any, line: string) => {
        sessionLogs += line;
        liveLogContent.innerText = line; // Show current line below spinner
    };
    ipcRenderer.on('tachyon-log', logHandler);

    ipcRenderer.send('tachyon-init', rpxFile, patchFile, outPath, false);

    ipcRenderer.once('tachyon-done', (e) => {
        ipcRenderer.removeListener('tachyon-log', logHandler);
        document.body.style.pointerEvents = "auto";
        spinContainer.style.display = "none";
        liveLogView.classList.add('hidden');
        
        showModal({
            title: 'Finished!',
            showLog: true,
            showCancel: true,
            cancelText: 'EXIT',
            cancelCallback: () => ipcRenderer.send('close', true),
            actionText: 'OK',
            actionCallback: () => {
                resetAll();
                hideModal();
            }
        });
        
        // Populate modal with cumulative logs
        document.getElementById('modal-log-content')!.innerText = sessionLogs;
    });

    ipcRenderer.once('tachyon-error', (e, err) => {
        ipcRenderer.removeListener('tachyon-log', logHandler);
        document.body.style.pointerEvents = "auto";
        spinContainer.style.display = "none";
        liveLogView.classList.add('hidden');

        showModal({
            title: 'Error',
            textContent: err || 'Something went wrong during the patch process.',
            showCancel: true,
            cancelText: 'EXIT',
            cancelCallback: () => ipcRenderer.send('close', true),
            actionText: 'OK',
            actionCallback: () => {
                resetAll();
                hideModal();
            }
        });
        
        // Populate modal with cumulative logs (including errors)
        document.getElementById('modal-log-content')!.innerText = sessionLogs;
    });
});

// System Error Handler (from main process)
ipcRenderer.on('system-error', (event, errorMessage) => {
    showModal({
        title: 'Error',
        textContent: errorMessage,
        actionText: 'OK',
        actionCallback: () => hideModal()
    });
});

// Update Available Handler
ipcRenderer.on('update-available', (event, version, url) => {
    showModal({
        title: 'Update available',
        textContent: `A new version of Trailblazer is available (${pkg.version} → ${version})\nWould you like to download it?`,
        showCancel: true,
        cancelText: 'No',
        actionText: 'Yes',
        actionCallback: () => {
            require('electron').shell.openExternal(url);
            hideModal();
        }
    });
});

// Deprecated Banner Click
document.getElementById('deprecated-banner')!.addEventListener('click', () => {
    showModal({
        title: 'Deprecated',
        textContent: 'Trailblazer has been deprecated in 2026 and should only be used for legacy mods.'
    });
});

document.getElementById('btn-typf')!.addEventListener('click', getTypf);
document.getElementById('btn-change-typf')!.addEventListener('click', getTypf);

// Show modal only for RPX selection
document.getElementById('btn-rpx')!.onclick = triggerRpxSelect;
document.getElementById('btn-change-rpx')!.onclick = triggerRpxSelect;

const minBtn = document.getElementById('btn-min')!;
minBtn.addEventListener('click', () => ipcRenderer.send('minimize-window'));

const closeBtn = document.getElementById('btn-close')!
closeBtn.addEventListener('click', () => ipcRenderer.send('close-window'));


document.getElementById('version')!.innerText = `Version ${pkg.version}\nZenith Team ${new Date().getFullYear()}`;

document.getElementById('btn-info')!.addEventListener('click', () => {
    require('electron').shell.openExternal('https://trailblazer.nsmbu.net/faq');
});

document.getElementById('modal-link-discord')!.addEventListener('click', () => {
    require('electron').shell.openExternal('https://go.nsmbu.net/discord');
});

let holder = document.getElementById('drag-file')!;
let popup = document.getElementById('dragpopup')!;

holder.ondragover = () => {
    popup.style.display = "block";
    return false;
}

holder.ondragleave = (e) => {
    popup.style.display = "none";
    return false;
};

holder.ondragend = () => {
    popup.style.display = "none";
    return false;
};

holder.ondrop = async (e) => {
    popup.style.display = "none";
    e.preventDefault();
    for (let f of e.dataTransfer!.files as any) {
        switch (path.extname(f.path)) {
            case '.typf':
            case '.typfb':
                typf([f.path]);
                break;
            case '.rpx':
                rpx([f.path]);
                break;
            default:
                console.log('Unknown file type');
                break;
        }
    }
    return false;
};