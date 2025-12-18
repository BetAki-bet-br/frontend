const fs = require('fs');
const path = require('path');
const glob = require('glob');

const scssFiles = glob.sync('src/**/*.scss', { ignore: ['node_modules/**'] });

scssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let newContent = content;

    // Regex for various @import/ @use patterns we need to replace
    const replacements = [
        // sass:map
        { regex: /@import "sass:map";/g, useStatement: '@use "sass:map" as map;' },
        { regex: /@use "sass:map";/g, useStatement: '@use "sass:map" as map;' },
        // sass:color
        { regex: /@import "sass:color";/g, useStatement: '@use "sass:color" as color;' },
        { regex: /@use "sass:color";/g, useStatement: '@use "sass:color" as color;' },

        // theme/utils
        { regex: /@import "src\/theme\/utils";/g, useStatement: '@use "theme/utils" as utils;' },
        { regex: /@use "src\/theme\/utils" as util;/g, useStatement: '@use "theme/utils" as utils;' }, // Fix alias util to utils
        { regex: /@use "src\/theme\/utils" as utils;/g, useStatement: '@use "theme/utils" as utils;' },
        { regex: /@import "theme\/utils";/g, useStatement: '@use "theme/utils" as utils;' },
        { regex: /@use "theme\/utils" as util;/g, useStatement: '@use "theme/utils" as utils;' }, // Fix alias util to utils


        // theme/theme-variables
        { regex: /@import "src\/theme\/theme-variables";/g, useStatement: '@use "theme/theme-variables" as theme-variables;' },
        { regex: /@use "src\/theme\/theme-variables" as theme-variables;/g, useStatement: '@use "theme/theme-variables" as theme-variables;' },
        { regex: /@use "theme\/theme-variables" as vars;/g, useStatement: '@use "theme/theme-variables" as theme-variables;' }, // Fix alias vars to theme-variables
        { regex: /@import "theme\/theme-variables";/g, useStatement: '@use "theme/theme-variables" as theme-variables;' },

        // theme/theme-fonts
        { regex: /@import "src\/theme\/theme-fonts";/g, useStatement: '@use "theme/theme-fonts" as theme-fonts;' },
        { regex: /@use "src\/theme\/theme-fonts";/g, useStatement: '@use "theme/theme-fonts" as theme-fonts;' },
        { regex: /@import "theme\/theme-fonts";/g, useStatement: '@use "theme/theme-fonts" as theme-fonts;' },

        // theme/theme
        { regex: /@import "src\/theme\/theme";/g, useStatement: '@use "theme/theme" as theme;' },
        { regex: /@use "src\/theme\/theme";/g, useStatement: '@use "theme/theme" as theme;' },
        { regex: /@import "theme\/theme";/g, useStatement: '@use "theme/theme" as theme;' },

        // @icore/ngx-atl-pp-templates-shared/index
        { regex: /@import "@icore\/ngx-atl-pp-templates-shared\/index";/g, useStatement: '@use "@icore/ngx-atl-pp-templates-shared/index" as templates-shared;' },
        { regex: /@use "@icore\/ngx-atl-pp-templates-shared\/index";/g, useStatement: '@use "@icore/ngx-atl-pp-templates-shared/index" as templates-shared;' },
    ];

    let usesToAdd = new Set();
    let lines = newContent.split('\n');
    let finalLines = [];
    let importSectionEnded = false;

    lines.forEach(line => {
        let matched = false;
        for (const rep of replacements) {
            if (line.match(rep.regex)) {
                usesToAdd.add(rep.useStatement);
                matched = true;
                // Don't add the original @import/@use line if it's being replaced
                // We'll add all @use at the top later
                break;
            }
        }
        if (!matched && line.trim().startsWith('@import')) {
            // Keep original @import if not handled by replacements yet
            finalLines.push(line);
        } else if (!matched && line.trim().startsWith('@use')) {
             // If it's an @use line not handled by specific replacements, but already a @use
             // and not a duplicate of one we plan to add
            if (!usesToAdd.has(line.trim())) {
                usesToAdd.add(line.trim());
            }
        } else if (!matched) {
            finalLines.push(line);
        }
    });

    // Clean up empty lines that might result from removing @import
    finalLines = finalLines.filter(line => line.trim() !== '');

    // Add required @use statements if specific mixins/functions are used
    if (newContent.match(/@include utils\.media\(/) && !Array.from(usesToAdd).some(u => u.includes('theme/utils'))) {
        usesToAdd.add('@use "theme/utils" as utils;');
    }
    if (newContent.match(/map\.get\(/) && !Array.from(usesToAdd).some(u => u.includes('sass:map'))) {
        usesToAdd.add('@use "sass:map" as map;');
    }
    if (newContent.match(/color\.adjust\(/) && !Array.from(usesToAdd).some(u => u.includes('sass:color'))) {
        usesToAdd.add('@use "sass:color" as color;');
    }
    if (newContent.match(/theme-variables\.\$app-custom-colors/g) && !Array.from(usesToAdd).some(u => u.includes('theme/theme-variables'))) {
         usesToAdd.add('@use "theme/theme-variables" as theme-variables;');
    }


    // Sort @use statements for consistency
    const sortedUses = Array.from(usesToAdd).sort().join('\n');

    // Combine new @use statements with the rest of the content
    newContent = sortedUses + (sortedUses ? '\n\n' : '') + finalLines.join('\n');

    // Phase 2: Update variable and mixin access
    // map.get($app-custom-colors, ...) -> map.get(theme-variables.$app-custom-colors, ...)
    newContent = newContent.replace(/map\.get\(\$app-custom-colors,/g, 'map.get(theme-variables.$app-custom-colors,');

    // @include util.media(...) -> @include utils.media(...)
    newContent = newContent.replace(/@include util\.media\(/g, '@include utils.media(');


    if (newContent !== originalContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Migrated: ${file}`);
    }
});

console.log('Sass migration script finished.');
