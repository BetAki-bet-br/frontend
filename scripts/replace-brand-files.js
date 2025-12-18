// Get the brand name from command-line arguments
const args = process.argv.slice(2);
const brandName = args[0];
const themeBrandName = args[1];

const fs = require('fs');
const path = require('path');

if (brandName) {
  replaceBrandFile(`../src/brand-sitemap/robots-${brandName}.txt`, `../src/robots.txt`, 'Robots');
  replaceBrandFile(`../src/brand-sitemap/sitemap-${brandName}.xml`, `../src/sitemap.xml`, 'Sitemap');
}

if (brandName) {
  replaceBrandFile(`../src/static-pages/index-${brandName}.html`, `../src/index.html`, 'Index');
}

if (themeBrandName) {
  replaceBrandFile(
    `../src/theme/brand-themes/theme-variables-${themeBrandName}.scss`,
    `../src/theme/theme-variables.scss`,
    `Stylesheet-${themeBrandName}`
  );
}

function replaceBrandFile(source, target, type) {
  // Define the source and destination paths based on the brand name
  const brandSpecificFile = path.resolve(__dirname, source);
  const vanillaFile = path.resolve(__dirname, target);

  fs.copyFileSync(brandSpecificFile, vanillaFile);
  console.log(`${type} replaced: ${brandSpecificFile} -> ${vanillaFile}`);
}
