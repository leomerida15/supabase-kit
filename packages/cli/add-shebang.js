const fs = require('fs');
const path = require('path');

const files = ['cli.esm.js', 'index.js'];

for (const file of files) {
    const filePath = path.join(__dirname, 'dist', file); // Cambia a la ruta correcta si es necesario
    const shebang = '#!/usr/bin/env node\n';

    // Prepend shebang to the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        // Check if the shebang is already there
        if (!data.startsWith(shebang)) {
            // Write the file back with shebang
            fs.writeFile(filePath, shebang + data, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    console.log('Shebang added successfully');
                }
            });
        }
    });
}
