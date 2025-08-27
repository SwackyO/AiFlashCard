import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { makeFlashcards } from '../services/gemini.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../');
const dataDir = path.join(root, 'data');

export async function generateFlashcards(req, res, next) {
    try {
        const { topic, topicId, config, count = 10, difficulty = 'mixed', specText } = req.body;

        let context = specText;
        if (!context && topicId && config) {
            const p = path.join(dataDir, `spec_outline_${config}.json`);
            if (!fs.existsSync(p)) return res.status(400).json({ error: 'Parsed outline not found for this config. Upload spec first.' });
            const json = JSON.parse(fs.readFileSync(p, 'utf8'));
            const outline = json.sections;

            if (/^\d+$/.test(topicId)) {
                const sec = outline[topicId];
                if (!sec) return res.status(400).json({ error: 'Section not found' });
                context = Object.entries(sec.subtopics || {})
                    .map(([k,v]) => `${k} ${v.title}\n${v.text}`)
                    .join('\n\n');
            } else {
                const [secId] = topicId.split('.');
                const node = outline[secId]?.subtopics?.[topicId];
                if (!node) return res.status(400).json({ error: 'Subtopic not found' });
                context = `${node.title}\n${node.text}`;
            }
        }

        if (!context && !topic) {
            return res.status(400).json({ error: 'Provide { topicId, config } or specText or topic' });
        }

        const flashcards = await makeFlashcards({
            specText: context,
            topic: topic || topicId || 'General',
            count,
            difficulty
        });

        res.json({ count: flashcards.length, flashcards });
    } catch (e) { next(e); }
}
