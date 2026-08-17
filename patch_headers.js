const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add bypass-tunnel-reminder to any headers object that doesn't have it
    content = content.replace(/headers:\s*\{([^}]*)\}/g, (match, inner) => {
        if (!inner.includes('bypass-tunnel-reminder')) {
            // Check if inner is empty or only whitespace
            if (inner.trim() === '') {
                return `headers: { 'bypass-tunnel-reminder': 'true' }`;
            } else {
                return `headers: {${inner}, 'bypass-tunnel-reminder': 'true' }`;
            }
        }
        return match;
    });

    fs.writeFileSync(filePath, content, 'utf8');
}

fs.readdirSync(servicesDir).forEach(file => {
    if (file.endsWith('.ts')) {
        processFile(path.join(servicesDir, file));
    }
});

console.log("All services patched with bypass-tunnel-reminder");
