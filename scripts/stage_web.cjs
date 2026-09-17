'use strict';
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'www');
fs.rmSync(target, {recursive: true, force: true});
fs.mkdirSync(target);
for (const name of ['index.html', 'app.js', 'cloud.js', 'config.js', 'styles.css', 'member-ui.css', 'sw.js', 'manifest.webmanifest', 'icon.svg', 'assets', 'vendor']) {
  fs.cpSync(path.join(root, name), path.join(target, name), {recursive: true});
}
console.log('Canonical web sources staged in www/.');
