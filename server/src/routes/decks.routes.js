// server/src/routes/decks.routes.js
import { Router } from 'express';
import Deck from '../models/deck.model.js';

const router = Router();
router.post('/', async (req, res, next) => {
    try {
        const { name, subject, specId, topicLabel, cards } = req.body;
        if (!name || !Array.isArray(cards)) {
            return res.status(400).json({ error: 'name and cards[] required' });
        }
        const deck = await Deck.create({ name, subject, specId, topicLabel, cards });
        res.status(201).json(deck);
    } catch (e) { next(e); }
});

// List decks
router.get('/', async (req, res, next) => {
    try {
        const decks = await Deck.find({}, { name: 1, createdAt: 1, updatedAt: 1, 'config.subject': 1 }).sort({ updatedAt: -1 }).lean();
        res.json(decks);
    } catch (e) { next(e); }
});

// Get one deck
router.get('/:id', async (req, res, next) => {
    try {
        const deck = await Deck.findById(req.params.id).lean();
        if (!deck) return res.status(404).json({ error: 'Deck not found' });
        if (deck.progress && deck.progress instanceof Map) deck.progress = Object.fromEntries(deck.progress);
        res.json(deck);
    } catch (e) { next(e); }
});

// Rename
router.put('/:id', async (req, res, next) => {
    try {
        const deck = await Deck.findByIdAndUpdate(
            req.params.id,
            { $set: { name: String(req.body.name || '').trim() } },
            { new: true }
        ).lean();
        res.json(deck);
    } catch (e) { next(e); }
});

// Delete
router.delete('/:id', async (req, res, next) => {
    try {
        await Deck.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (e) { next(e); }
});

router.patch('/:id/progress', async (req, res, next) => {
    try {
        const { index, status } = req.body;
        if (typeof index !== 'number' && typeof index !== 'string') {
            return res.status(400).json({ error: 'index required' });
        }
        if (!['known','learning','unknown'].includes(status)) {
            return res.status(400).json({ error: 'bad status' });
        }

        const key = String(index);
        // Save: progress.<index> = status
        await Deck.updateOne(
            { _id: req.params.id },
            { $set: { [`progress.${key}`]: status } }
        );

        const deck = await Deck.findById(req.params.id).lean();
        const progress = deck?.progress instanceof Map
            ? Object.fromEntries(deck.progress.entries())
            : (deck?.progress || {});
        return res.json({ ok: true, progress });
    } catch (e) { next(e); }
});

export default router;
