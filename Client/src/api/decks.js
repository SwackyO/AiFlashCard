import http from './http';

export const createDeck     = (payload)              => http.post('/api/decks', payload).then(r=>r.data);
export const getDeck        = (id)                   => http.get(`/api/decks/${id}`).then(r=>r.data);
export const listDecks      = ()                     => http.get('/api/decks').then(r=>r.data);
export const renameDeck     = (id, name)             => http.put(`/api/decks/${id}`, { name }).then(r=>r.data);
export const deleteDeck     = (id)                   => http.delete(`/api/decks/${id}`).then(r=>r.data);
export const updateProgress = (id, idx, status)      => http.patch(`/api/decks/${id}/progress`, { index: idx, status }).then(r=>r.data);
