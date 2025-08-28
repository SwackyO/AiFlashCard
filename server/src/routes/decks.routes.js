import { Router } from 'express';
import Deck from '../models/deck.model.js';

const router = Router();

// Create deck (owned by current user)
router.post('/', async (req, res, next) => {
    try {
        const { name, subject, specId, topicLabel, cards } = req.body;
        if (!name || !Array.isArray(cards)) {
            return res.status(400).json({ error: 'name and cards[] required' });
        }
        const deck = await Deck.create({
            name, subject, specId, topicLabel, cards,
            userId: req.user.id,
        });
        res.status(201).json(deck);
    } catch (e) { next(e); }
});

// List ONLY my decks
router.get('/', async (req, res, next) => {
    try {
        const decks = await Deck.find(
            { userId: req.user.id },
            { name: 1, createdAt: 1, updatedAt: 1, 'config.subject': 1 }
        ).sort({ updatedAt: -1 }).lean();
        res.json(decks);
    } catch (e) { next(e); }
});

// Get one deck (only if I own it)
router.get('/:id', async (req, res, next) => {
    try {
        const deck = await Deck.findOne({ _id: req.params.id, userId: req.user.id }).lean();
        if (!deck) return res.status(404).json({ error: 'Deck not found' });
        if (deck.progress && deck.progress instanceof Map) deck.progress = Object.fromEntries(deck.progress);
        res.json(deck);
    } catch (e) { next(e); }
});

// Rename (owner only)
router.put('/:id', async (req, res, next) => {
    try {
        const deck = await Deck.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $set: { name: String(req.body.name || '').trim() } },
            { new: true }
        ).lean();
        if (!deck) return res.status(404).json({ error: 'Deck not found' });
        res.json(deck);
    } catch (e) { next(e); }
});

// Delete (owner only)
router.delete('/:id', async (req, res, next) => {
    try {
        const del = await Deck.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!del) return res.status(404).json({ error: 'Deck not found' });
        res.json({ ok: true });
    } catch (e) { next(e); }
});

// Progress (owner only)
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

        const upd = await Deck.updateOne(
            { _id: req.params.id, userId: req.user.id },
            { $set: { [`progress.${key}`]: status } }
        );
        if (upd.matchedCount === 0) return res.status(404).json({ error: 'Deck not found' });

        const deck = await Deck.findOne({ _id: req.params.id, userId: req.user.id }).lean();
        const progress = deck?.progress instanceof Map
            ? Object.fromEntries(deck.progress.entries())
            : (deck?.progress || {});
        return res.json({ ok: true, progress });
    } catch (e) { next(e); }
});

export default router;
