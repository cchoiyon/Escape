const fs = require('fs');
const path = require('path');

function search(dir, term) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            search(fullPath, term);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.mjs')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(term)) {
                console.log(fullPath);
            }
        }
    }
}

search('node_modules/framer-motion', 'dimensions');

