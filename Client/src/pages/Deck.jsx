import { useEffect, useState } from 'react';
import { listDecks, deleteDeck } from '../api/decks';
import { Link } from 'react-router-dom';

export default function Deck() {
    const [decks, setDecks] = useState([]);
    const [q, setQ] = useState('');

    async function load() {
        const data = await listDecks(q ? { query: q } : {});
        setDecks(data);
    }
    useEffect(()=>{ load(); }, []);

    return (
        <div className="container py-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Decks</h1>
                <div className="flex gap-2">
                    <input className="input" placeholder="Search…" value={q} onChange={(e)=>setQ(e.target.value)} />
                    <button className="btn" onClick={load}>Search</button>
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map(d => (
                    <div key={d._id} className="card flex flex-col">
                        <div className="text-lg font-semibold">{d.name}</div>
                        <div className="text-xs opacity-60">{d.config?.subject} • {d.config?.board} • {d.selection?.join(', ')}</div>
                        <div className="mt-3 text-sm opacity-70">{d.cards?.length || 0} cards • {new Date(d.updatedAt).toLocaleString()}</div>
                        <div className="mt-4 flex gap-2">
                            <Link className="btn" to={`/decks/${d._id}`}>Open</Link>
                            <button className="btn-outline" onClick={async ()=>{
                                if (confirm('Delete this deck?')) { await deleteDeck(d._id); await load(); }
                            }}>Delete</button>
                        </div>
                    </div>
                ))}
                {decks.length === 0 && <div className="card">No decks yet. Generate some cards, then save as a deck.</div>}
            </div>
        </div>
    );
}
