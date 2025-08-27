import { useMemo, useState } from "react";

export default function TopicTree({ outline, onPick, selectedIds, onToggle }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(() => new Set(Object.keys(outline.sections || {})));

    const sections = outline?.sections || {};
    const q = query.trim().toLowerCase();

    const filtered = useMemo(() => {
        if (!q) return sections;
        const out = {};
        for (const [sid, sec] of Object.entries(sections)) {
            const hitSec = (sec.title || '').toLowerCase().includes(q);
            const sub = {};
            for (const [tid, t] of Object.entries(sec.subtopics || {})) {
                if (
                    hitSec ||
                    tid.toLowerCase().includes(q) ||
                    (t.title || '').toLowerCase().includes(q)
                ) sub[tid] = t;
            }
            if (hitSec || Object.keys(sub).length) out[sid] = { ...sec, subtopics: sub };
        }
        return out;
    }, [sections, q]);

    function toggleSection(sid) {
        setOpen(prev => {
            const n = new Set(prev);
            if (n.has(sid)) n.delete(sid); else n.add(sid);
            return n;
        });
    }

    return (
        <div className="card">
            <div className="flex items-center gap-2 mb-3">
                <input
                    className="input"
                    placeholder="Search topics or 14.2, 3.4, …"
                    value={query}
                    onChange={e=>setQuery(e.target.value)}
                />
                <button className="btn-ghost" onClick={() => setOpen(new Set(Object.keys(sections)))}>Expand all</button>
                <button className="btn-ghost" onClick={() => setOpen(new Set())}>Collapse all</button>
            </div>

            <div className="max-h-[70vh] overflow-auto pr-2 space-y-3">
                {Object.entries(filtered).map(([sid, sec]) => (
                    <div key={sid} className="rounded-xl border border-slate-700/40 p-3">
                        <button
                            className="w-full text-left font-semibold flex items-center justify-between"
                            onClick={() => toggleSection(sid)}
                        >
                            <span>{sid}. {sec.title}</span>
                            <span className="text-xs opacity-70">{open.has(sid) ? 'Hide' : 'Show'}</span>
                        </button>

                        {open.has(sid) && (
                            <div className="mt-3 grid gap-2">
                                {Object.entries(sec.subtopics || {}).map(([tid, t]) => (
                                    <div key={tid} className="flex items-center gap-2 rounded-lg bg-slate-900/40 border border-slate-800 px-3 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(tid)}
                                            onChange={() => onToggle(tid)}
                                        />
                                        <button
                                            className="btn-outline text-sm"
                                            onClick={() => onPick(tid)}
                                        >
                                            Open
                                        </button>
                                        <div className="text-sm">
                                            <div className="font-medium">{tid} — {t.title}</div>
                                            {/* optional one-liner preview of first bullet */}
                                            {Array.isArray(t.bullets) && t.bullets[0] && (
                                                <div className="text-slate-400 text-xs truncate max-w-[28rem]">
                                                    {t.bullets[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(sec.subtopics || {}).length === 0 && (
                                    <div className="text-sm text-slate-400">No subtopics parsed in this section.</div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
