import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer:   { type: String, required: true },
    topic:    { type: String, default: 'General' },
    difficulty:{ type: String, enum: ['easy','medium','hard','mixed'], default: 'mixed' },
    distractors: [{ type: String }]
}, { _id: false });

const DeckSchema = new mongoose.Schema({
    name:  { type: String, required: true },
    config:{ type: Object },
    selection: { type: [String], default: [] },
    generatedFrom:{ type: String, enum: ['topic','mixed','raw'], default: 'mixed' },
    difficulty:  { type: String, default: 'mixed' },
    count: { type: Number, default: 8 },
    cards: { type: [CardSchema], default: [] },
    progress: { type: Map, of: String, default: () => ({}) },
    userId: { type: String, required: true, index: true },   // <-- now required
}, { timestamps: true });

DeckSchema.set('toJSON', {
    transform(_doc, ret) {
        if (ret.progress && ret.progress instanceof Map) {
            ret.progress = Object.fromEntries(ret.progress.entries());
        }
        return ret;
    }
});

export default mongoose.model('Deck', DeckSchema);
