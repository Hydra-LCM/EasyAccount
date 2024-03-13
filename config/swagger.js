import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const processSwaggerDocuments = () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const controllersDir = path.join(__dirname, '../app/swagger');
    const controllerFiles = fs.readdirSync(controllersDir);
    
    let aggregatedPaths = {};
    let baseSwaggerDocument;

    controllerFiles.forEach(file => {
        if (file.endsWith('.json')) {
            const swaggerDocumentPath = path.join(controllersDir, file);
            const swaggerDocument = JSON.parse(fs.readFileSync(swaggerDocumentPath, { encoding: 'utf8' }));

            if (file.match('base-swagger.json')) {
                baseSwaggerDocument = swaggerDocument;
            } else {
                const paths = swaggerDocument.paths;
                Object.keys(paths).forEach(path => {
                    if (!aggregatedPaths[path]) {
                        aggregatedPaths[path] = paths[path];
                    } else {
                        aggregatedPaths[path] = { ...aggregatedPaths[path], ...paths[path] };
                    }
                });
            }
        }
    });

    return { baseSwaggerDocument, aggregatedPaths };
};
