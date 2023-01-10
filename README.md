# Trailblazer
An easy new way to install Wii U mods.

## Install
Download the latest build from GitHub releases.

### One Time Setup
```sh
git clone https://github.com/Zenith-Team/Trailblazer
cd Trailblazer
npm i -D
```

### Building distributables
```sh
npm run make
```

### Running
```sh
# Run this on a separate terminal from your main one
# Keep it running in the background
# It will continuously automatically build TS files on changes
npm run watch
```
```sh
npm start # Production mode
npm test # Development mode
```
* **Production mode**: Accurate to how the app will look and behave when packaged.
    * Frameless, DevTools disabled, no toolbar, no hot-reloading
* **Development mode**: Enables development features at the cost of visual accuracy.
    * Framed, DevTools enabled, toolbar, automatic hot-reloading*
    * \* Only if `npm run watch` is running in the background.
