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
    rpxbtn.addEventListener('click', getRpx);

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
function resetAll () {
    patchFile = '';
    rpxFile = '';

    patchSelected = false;
    rpxSelected = false;

    document.getElementById('txt-typf')!.style.display = 'none';
    document.getElementById('btn-change-typf')!.style.display = 'none';

    document.getElementById('txt-rpx')!.style.display = 'none';
    document.getElementById('btn-change-rpx')!.style.display = 'none';

    document.getElementById('btn-rpx')!.style.display = 'block';
    document.getElementById('btn-typf')!.style.display = 'block';
    document.getElementById('btn-rpx')!.className = 'btndeactive';
    document.getElementById('btn-patch')!.className = 'btndeactive';


}

function patchBtn () {
    const btn: HTMLElement = document.getElementById('btn-patch')!;
    btn.className = 'btn';
    let done1 = false;

    btn.addEventListener('click', async () => {
        if (done1) return;
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
        done1 = false;
        if (!outPath) return;
        document.getElementById("container")!.style.display = "inline-block";
        //blur the whole page
        document.getElementById("body")!.style.filter = "blur(5px)";

        btn.className = 'btndeactive';

        ipcRenderer.send('tachyon-init', rpxFile, patchFile, outPath, false);

        ipcRenderer.once('tachyon-done', (e) => {
            let txt: HTMLElement = document.getElementById('doneTxt')!;
            txt.innerText = 'Finished!';
            document.getElementById("container")!.style.display = "none";

            txt.style.display = "block";
            resetAll()

            outPath = null;
            setTimeout(() => ipcRenderer.send('close', true), 2000);
        });
        ipcRenderer.once('tachyon-error', (e, err) => {
            document.getElementById("container")!.style.display = "none";
            let txt: HTMLElement = document.getElementById('doneTxt')!;
            txt.style.display = "block";
            txt.innerText = 'Error, please relaunch';
            resetAll()
            setInterval(() => {
                ipcRenderer.send('close', true);
            }, 2000);
            outPath = null;
        });
    });
}

document.getElementById('btn-typf')!.addEventListener('click', getTypf);
document.getElementById('btn-change-typf')!.addEventListener('click', getTypf);
document.getElementById('btn-change-rpx')!.addEventListener('click', getRpx);
document.getElementById('btn-min')!.addEventListener('click', () => ipcRenderer.send('minimize-window'));
document.getElementById('btn-close')!.addEventListener('click', () => ipcRenderer.send('close-window'));
document.getElementById('version')!.innerText = `Version ${pkg.version}\nZenith Team ${new Date().getFullYear()}`;

document.getElementById('btn-info')!.addEventListener('click', () => {
    require('electron').shell.openExternal('https://trailblazer.nsmbu.net/faq');
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
    for (let f of e.dataTransfer!.files) {
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


