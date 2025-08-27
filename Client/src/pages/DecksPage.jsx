// client/src/pages/DecksPage.jsx
import { useEffect, useState } from 'react';
import { listDecks, deleteDeck, renameDeck } from '../api/decks';
import { Link, useNavigate } from 'react-router-dom';

export default function DecksPage() {
    const [decks, setDecks] = useState(null);
    const navigate = useNavigate();

    async function load() {
        const data = await listDecks();
        setDecks(data);
    }
    useEffect(() => { load(); }, []);

    async function onDelete(id) {
        if (!confirm('Delete this deck? This cannot be undone.')) return;
        await deleteDeck(id);
        await load();
    }

    async function onRename(id, current) {
        const name = prompt('Rename deck:', current);
        if (!name || name.trim() === current) return;
        await renameDeck(id, name.trim());
        await load();
    }

    if (!decks) return <div className="container py-6">Loading…</div>;

    return (
        <div className="container py-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Your Decks</h1>
                <button className="btn-outline" onClick={() => navigate('/')}>+ New deck</button>
            </div>

            {decks.length === 0 ? (
                <div className="card">No decks yet. Generate one from the Generator tab.</div>
            ) : (
                <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {decks.map(d => (
                        <li className="rounded-2xl border p-4 bg-white shadow-sm border-slate-200 dark:bg-panel dark:border-slate-800">
                            <div className="font-medium">{d.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{d.config?.subject || 'Deck'}</div>
                            <div className="mt-3 flex gap-2">
                                <Link className="btn" to={`/decks/${d._id}`}>Open</Link>
                                <button className="btn-outline" onClick={() => onRename(d._id, d.name)}>Rename</button>
                                <button className="btn-outline" onClick={() => onDelete(d._id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
