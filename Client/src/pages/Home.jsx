import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopics, getTopic } from '../api/spec';
import { generateFlashcards } from '../api/flashcards';
import { createDeck } from '../api/decks'; // <-- add this if not already
import UploadSpec from '../components/UploadSpec';
import TopicTree from '../components/TopicTree';
import ControlsBar from '../components/ControlsBar';
import TopicView from '../components/TopicView';
import { useToast } from '../components/ui/Toast';

const AUTO_REDIRECT = true; // set false to use toast only

export default function Home() {
    const [config, setConfig] = useState(null);
    const [outline, setOutline] = useState(null);

    const [currentId, setCurrentId] = useState(null);
    const [currentNode, setCurrentNode] = useState(null);

    const [count, setCount] = useState(8);
    const [difficulty, setDifficulty] = useState('mixed');

    const [status, setStatus] = useState({});
    const [filter, setFilter] = useState('all');
    const [diffFilter, setDiffFilter] = useState('all');

    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const nav = useNavigate();

    async function loadOutline(cfg) {
        setConfig(cfg);
        setLoading(true);
        try {
            const data = await getTopics(cfg);
            setOutline(data);
        } catch (e) {
            alert(e?.response?.data?.error || e.message);
        } finally { setLoading(false); }
    }

    async function openTopic(id) {
        if (!config) return;
        setLoading(true);
        try {
            const node = await getTopic(config, id);
            setCurrentId(id);
            setCurrentNode(node);
            setStatus({});
        } catch (e) {
            alert(e?.response?.data?.error || e.message);
        } finally { setLoading(false); }
    }

    function toggleSelect(id) {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
    }

    async function genCards() {
        if (!config) return alert('Upload & choose a spec first.');
        setLoading(true);
        try {
            let flashcards = [];

            // Case A: multi-select → merge texts and send specText
            if (selectedIds.length > 0) {
                const pieces = await Promise.all(
                    selectedIds.map(id =>
                        getTopic(config, id).then(n => {
                            const hdr = `${id} ${n.title || ''}`.trim();
                            const body = n.text || (Array.isArray(n.bullets) ? n.bullets.join('\n') : '') || '';
                            return `${hdr}\n${body}`;
                        })
                    )
                );
                const merged = pieces.join('\n\n---\n\n');
                const resp = await generateFlashcards({
                    specText: merged,
                    topic: `Mixed: ${selectedIds.join(', ')}`,
                    count,
                    difficulty,
                });
                flashcards = (resp.flashcards || []).map(c => ({
                    ...c, difficulty: (c.difficulty || 'mixed').toLowerCase()
                }));
            } else {
                // Case B: single topic
                if (!currentId) return alert('Pick a topic (left) or multi-select some.');
                const resp = await generateFlashcards({
                    config, topicId: currentId, count, difficulty
                });
                flashcards = (resp.flashcards || []).map(c => ({
                    ...c, difficulty: (c.difficulty || 'mixed').toLowerCase()
                }));
            }

            // Save deck + redirect/toast
            const name = prompt('Name for this deck?', `Deck — ${new Date().toLocaleString()}`) || 'Untitled Deck';
            const saved = await createDeck({
                name,
                subject: outline?.subject || 'General',
                topic: selectedIds.length ? `Mixed (${selectedIds.join(', ')})` : currentId,
                cards: flashcards
            });

            if (AUTO_REDIRECT) {
                nav(`/decks/${saved._id}`);
            } else {
                toast.push('Flashcards generated — check your Decks to access.', { type: 'success' });
            }

            // clear selection
            setSelectedIds([]);
            setStatus({});
        } catch (e) {
            alert(e?.message || 'Failed to generate');
        } finally { setLoading(false); }
    }

    // progress used only for controls bar meter
    const progress = useMemo(() => ({ total: 0, known: 0, learning: 0, unknown: 0 }), []);

    return (
        <div className="container py-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">AI Flashcards — Spec to Cards</h1>

            <UploadSpec onUploaded={loadOutline} />

            {loading && <div className="card">Working…</div>}

            <div className="grid lg:grid-cols-[minmax(360px,1fr)_minmax(520px,1.5fr)] gap-6">
                {/* LEFT: scrollable topics & selection */}
                <div className="space-y-6">
                    {outline ? (
                        <TopicTree
                            outline={outline}
                            onPick={openTopic}
                            selectedIds={selectedIds}
                            onToggle={toggleSelect}
                        />
                    ) : (
                        <div className="card">Upload a PDF, then choose a config to fetch topics.</div>
                    )}
                </div>

                {/* RIGHT: controls + topic preview (no deck preview!) */}
                <div className="space-y-6">
                    <ControlsBar
                        count={count} setCount={setCount}
                        difficulty={difficulty} setDifficulty={setDifficulty}
                        onGenerate={genCards} canGenerate={!!config && (!!currentId || selectedIds.length > 0)}
                        filter={filter} setFilter={setFilter}
                        diffFilter={diffFilter} setDiffFilter={setDiffFilter}
                        progress={progress} hasCards={false}
                        selectedCount={selectedIds.length}
                    />
                    {currentNode && (
                        <TopicView node={currentNode} id={currentId} />
                    )}
                </div>
            </div>
        </div>
    );
}
