import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { loadSpecConfig } from '../utils/spec-config.js';
import { fileURLToPath } from 'url';
import { extractFullOutlineWithGemini } from '../services/gemini.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../');
const dataDir = path.join(root, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const uploadsDir = path.join(root, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

const router = Router();

/**
 * POST /api/spec/upload?config=edexcel-ial-physics
 * form-data: file=<PDF file>
 * Uses Gemini to extract everything.
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file received. Use field "file".' });

        const configName = req.query.config;
        if (!configName) return res.status(400).json({ error: 'Missing ?config=' });

        const cfg = loadSpecConfig(configName); // still useful for board/spec/subject labels

        // 1) read PDF
        const buf = fs.readFileSync(req.file.path);
        const data = await pdf(buf);

        // 2) Gemini does ALL extraction
        const outline = await extractFullOutlineWithGemini({
            board: cfg.board,
            specId: cfg.spec_id,
            subject: cfg.subject,
            fullText: data.text
        });

        // 3) Save
        const outPath = path.join(dataDir, `spec_outline_${configName}.json`);
        fs.writeFileSync(outPath, JSON.stringify(outline, null, 2));

        const sectionCount = Object.keys(outline.sections || {}).length;
        res.json({ ok: true, board: outline.board, subject: outline.subject, sections: sectionCount });
    } catch (e) {
        console.error('[upload error]', e);
        next(e);
    }
});

/**
 * GET /api/spec/topics?config=edexcel-ial-physics
 */
router.get('/topics', (req, res) => {
    const configName = req.query.config;
    if (!configName) return res.status(400).json({ error: 'Missing ?config=' });
    const p = path.join(dataDir, `spec_outline_${configName}.json`);
    if (!fs.existsSync(p)) return res.status(404).json({ error: 'Outline not found. Upload first.' });
    const json = JSON.parse(fs.readFileSync(p, 'utf8'));
    res.json(json);
});

/**
 * GET /api/spec/topic/:id?config=edexcel-ial-physics
 * :id like "2.3" (subtopic) or "2" (whole unit)
 */
router.get('/topic/:id', (req, res) => {
    const configName = req.query.config;
    if (!configName) return res.status(400).json({ error: 'Missing ?config=' });
    const p = path.join(dataDir, `spec_outline_${configName}.json`);
    if (!fs.existsSync(p)) return res.status(404).json({ error: 'Outline not found. Upload first.' });

    const { sections } = JSON.parse(fs.readFileSync(p, 'utf8'));
    const id = req.params.id;

    if (/^\d+$/.test(id)) {
        const sec = sections[id];
        if (!sec) return res.status(404).json({ error: 'Section not found' });
        // merge bullets of all subtopics into text for convenience
        const merged = Object.entries(sec.subtopics || {})
            .map(([k, v]) => `${k} ${v.title}\n${(v.bullets || []).join('\n')}`)
            .join('\n\n');
        return res.json({ id, title: sec.title, text: merged, subtopics: sec.subtopics || {} });
    }

    const [secId] = id.split('.');
    const node = sections?.[secId]?.subtopics?.[id];
    if (!node) return res.status(404).json({ error: 'Subtopic not found' });
    res.json({ id, title: node.title, bullets: node.bullets || [] });
});

export default router;
