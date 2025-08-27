// src/api/flashcards.js
import http from './http';

// Works for either: topicId or specText
export async function generateFlashcards({ config, topicId, specText, topic='Mixed', count=8, difficulty='mixed' }) {
    const payload = specText
        ? { specText, topic, count, difficulty }
        : { config, topicId, count, difficulty };

    const { data } = await http.post('/api/flashcards/generate', payload);
    return data; // { flashcards: [...] }
}
