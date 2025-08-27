import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../');

export function loadSpecConfig(configName) {
    const p = path.join(root, 'spec-configs', `${configName}.json`);
    if (!fs.existsSync(p)) throw new Error(`Unknown spec config: ${configName}`);
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}
