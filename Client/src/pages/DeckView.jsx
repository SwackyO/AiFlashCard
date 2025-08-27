// DeckView.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { getDeck, updateProgress, renameDeck, deleteDeck } from '../api/decks';
import Card from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';

function normalizeProgress(p) {
    if (!p) return {};
    if (p instanceof Map) return Object.fromEntries(p);
    if (Array.isArray(p)) return Object.fromEntries(p);
    if (typeof p === 'object') return p;
    return {};
}

export default function DeckView({ deckId }) {
    const [deck, setDeck] = useState(null);
    const [i, setI] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [localProgress, setLocalProgress] = useState({});
    const seededRef = useRef(false); // prevent re-seeding over optimistic state

    const load = useCallback(async () => {
        const data = await getDeck(deckId);
        setDeck(data);
        if (!seededRef.current) {
            seededRef.current = true;
            setLocalProgress(normalizeProgress(data?.progress));
        }
    }, [deckId]);

    useEffect(() => { seededRef.current = false; load(); }, [load]);

    const serverProgress = useMemo(
        () => normalizeProgress(deck?.progress),
        [deck]
    );

    const card = deck?.cards?.[i];
    const status =
        localProgress[String(i)] ??
        serverProgress[String(i)] ??
        'unknown';

    const mark = async (next) => {
        const key = String(i);
        // optimistic
        setLocalProgress(prev => ({ ...prev, [key]: next }));
        try {
            const resp = await updateProgress(deck._id, i, next); // should return {progress}
            if (resp?.progress) {
                const merged = { ...serverProgress, ...resp.progress };
                setDeck(d => d ? { ...d, progress: merged } : d);
                setLocalProgress(prev => ({ ...prev, ...resp.progress })); // keep local in sync
            }
        } catch {
            // optional: reload to recover
            await load();
        }
    };

    const back = () => {
        if (history.length > 1) history.back();
        else location.href = '/decks';
    };

    const goPrev = () => { setI(v => Math.max(0, v - 1)); setShowAnswer(false); };
    const goNext = () => { if (!deck?.cards?.length) return; setI(v => Math.min(deck.cards.length - 1, v + 1)); setShowAnswer(false); };

    if (!deck) return <div className="container py-6">Loading…</div>;
    if (!card) return <div className="container py-6">No cards in this deck.</div>;

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button className="btn-outline" onClick={back}>← Back</button>
                        <h1 className="text-xl md:text-2xl font-semibold">{deck.name}</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <button className="btn-outline" onClick={async () => {
                            const name = prompt('Rename deck:', deck.name);
                            if (!name) return;
                            await renameDeck(deck._id, name.trim());
                            setDeck(d => ({ ...d, name: name.trim() }));
                        }}>Rename</button>
                        <button className="btn-outline" onClick={async () => {
                            if (!confirm('Delete this deck?')) return;
                            await deleteDeck(deck._id);
                            location.href='/decks';
                        }}>Delete</button>
                        <div className="opacity-70">{i + 1} / {deck.cards.length} • status: {status}</div>
                    </div>
                </div>

                <Card className="mt-2">
                    <div className="flex flex-wrap items-center gap-2 text-slate-300">
                        {card.topic && <Chip>{card.topic}</Chip>}
                        <Chip className="capitalize">{card.difficulty || 'mixed'}</Chip>
                    </div>

                    <div className="mt-4 md:mt-5 text-lg md:text-xl font-medium leading-relaxed text-slate-100 whitespace-pre-wrap">
                        {card.question}
                    </div>

                    {showAnswer ? (
                        <div className="mt-6 rounded-xl border border-emerald-900/40 bg-emerald-900/20 p-4 md:p-5">
                            <div className="font-semibold text-emerald-300">Answer</div>
                            <div className="mt-1 text-slate-100 whitespace-pre-wrap">{card.answer}</div>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <button className="btn" onClick={() => setShowAnswer(true)}>Show answer</button>
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        <button className="btn-outline" onClick={goPrev}>Prev</button>
                        <button className="btn-outline" onClick={goNext}>Next</button>
                        <div className="flex-1" />
                        <button className="btn" onClick={() => mark('known')}>Mark Known</button>
                        <button className="btn-outline" onClick={() => mark('learning')}>Mark Learning</button>
                        <button className="btn-outline" onClick={() => mark('unknown')}>Mark Unknown</button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
