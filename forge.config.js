import path from 'path';
import fs from 'fs';

const config = {
  packagerConfig: {
    icon: path.resolve('asset/icon.icns'),
      asar: {
        unpack: '**/node_modules/{tachyon,chalk,rpxlib,tail,yaml,@foxglove/crc}/**/*'
      },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
    {
      name: '@rabbitholesyndrome/electron-forge-maker-portable',
      config: {
        portable: {
          artifactName: 'Trailblazer-${version}.exe',
        },
      },
      platforms: ['win32'],
    },
  ],
  hooks: {
    postMake: async (forgeConfig, makeResults) => {
      for (const result of makeResults) {
        for (const artifactPath of result.artifacts) {
          const platform = result.platform; // win32, linux, darwin
          let targetDir = '';
          
          if (platform === 'win32') targetDir = 'windows';
          else if (platform === 'linux') targetDir = 'linux';
          
          if (targetDir) {
            const destDir = path.join(process.cwd(), 'out', targetDir);
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            
            const fileName = path.basename(artifactPath);
            const destPath = path.join(destDir, fileName);
            
            console.log(`Moving ${fileName} to ${destPath}`);
            fs.copyFileSync(artifactPath, destPath);
          }
        }
      }
    }
  }
};

export default config;
