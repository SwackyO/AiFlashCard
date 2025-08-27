import { useMemo, useState } from 'react';
import clsx from 'classnames';

export default function FlashcardDeck({ cards, fullList, status, onMark }) {
    // Keep an index inside the *filtered* list
    const [idx, setIdx] = useState(0);
    const [show, setShow] = useState(false);

    const card = cards?.[idx];

    function next() {
        if (!cards?.length) return;
        setIdx((idx + 1) % cards.length);
        setShow(false);
    }
    function prev() {
        if (!cards?.length) return;
        setIdx((idx - 1 + cards.length) % cards.length);
        setShow(false);
    }

    if (!cards?.length) return null;

    const originalIndex = card._i; // index in the full list for status tracking
    const s = status[originalIndex] || 'unknown';

    return (
        <div className="rounded-3xl shadow-xl border border-gray-100/60 backdrop-blur-xl bg-white/80">
            <div className="p-4 md:p-5 flex items-center justify-between">
                <div className="text-sm opacity-70">
                    {idx + 1}/{cards.length} • {card.topic} • <span className="uppercase">{card.difficulty}</span>
                </div>
                <div className="flex gap-2">
                    <button className="btn-outline" onClick={prev}>Prev</button>
                    <button className="btn" onClick={() => setShow(v=>!v)}>{show ? 'Hide' : 'Reveal'}</button>
                    <button className="btn-outline" onClick={next}>Next</button>
                </div>
            </div>

            <div className="px-4 md:px-5 pb-5">
                <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white p-5">
                    <div className="text-lg font-semibold leading-snug">{card.question}</div>

                    {/* Answer panel */}
                    {show && (
                        <div className="mt-4 space-y-3">
                            <div className="p-4 rounded-xl bg-white border border-gray-100">
                                {card.answer}
                            </div>

                            {card.distractors?.length > 0 && (
                                <div className="text-sm">
                                    <div className="font-medium mb-1">Plausible distractors</div>
                                    <ul className="list-disc ml-5">{card.distractors.map((d, i)=> <li key={i}>{d}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Status actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <button
                        className={clsx('px-3 py-2 rounded-lg text-sm border', s==='unknown' ? 'bg-gray-100' : 'bg-white')}
                        onClick={() => onMark(originalIndex, 'unknown')}
                        title="Unseen / Reset"
                    >Unseen</button>

                    <button
                        className={clsx('px-3 py-2 rounded-lg text-sm border', s==='learning' ? 'bg-amber-100' : 'bg-white')}
                        onClick={() => onMark(originalIndex, 'learning')}
                        title="Still learning"
                    >Learning</button>

                    <button
                        className={clsx('px-3 py-2 rounded-lg text-sm border', s==='known' ? 'bg-emerald-100' : 'bg-white')}
                        onClick={() => onMark(originalIndex, 'known')}
                        title="I know this"
                    >Known</button>
                </div>
            </div>
        </div>
    );
}
