const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      copyDirSync(srcPath, destPath) :
      fs.copyFileSync(srcPath, destPath);
  }
}

const srcDir = path.resolve(__dirname, '../ngx-atl-pp-templates-shared');
const destDir = path.resolve(__dirname, '../node_modules/@icore/ngx-atl-pp-templates-shared');

console.log(`Copying @ngx-atl-pp-templates-shared to node_modules...`);

// Remove a pasta de destino se ela existir para garantir uma cópia limpa
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
  console.log(`Removed existing directory: ${destDir}`);
}

copyDirSync(srcDir, destDir);
console.log('Successfully copied shared templates to node_modules.');
