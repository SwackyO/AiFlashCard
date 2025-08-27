// src/components/ControlsBar.jsx
import React from 'react';

export default function ControlsBar({
                                        count, setCount,
                                        difficulty, setDifficulty,
                                        filter, setFilter,
                                        diffFilter, setDiffFilter,
                                        selectedCount = 0,
                                        onGenerate, canGenerate,
                                        progress = { total: 0, known: 0, learning: 0, unknown: 0 },
                                        hasCards = false,
                                    }) {
    return (
        <div className="card p-5 md:p-6">
            <div className="text-base font-medium text-slate-200 dark:text-slate-100 mb-4">
                Create / Filter
            </div>

            {/* FLEX not grid -> wraps safely; button never escapes */}
            <div className="flex flex-wrap items-end gap-4">
                <Field label="Generate difficulty" className="basis-[220px] grow">
                    <select
                        className="input h-10"
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                    >
                        <option value="mixed">Mixed</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </Field>

                <Field label="Generate count" className="basis-[140px]">
                    <input
                        className="input h-10"
                        type="number"
                        min={1}
                        max={128}
                        value={count}
                        onChange={e => setCount(Number(e.target.value || 0))}
                    />
                </Field>

                <Field label="Filter by status" className="basis-[220px] grow">
                    <select
                        className="input h-10"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="known">Known</option>
                        <option value="learning">Learning</option>
                        <option value="unknown">Unseen</option>
                    </select>
                </Field>

                <Field label="Filter by difficulty" className="basis-[220px] grow">
                    <select
                        className="input h-10"
                        value={diffFilter}
                        onChange={e => setDiffFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </Field>

                <Field label="Selection" className="basis-[160px]">
                    <span className="chip h-10 inline-flex items-center">{selectedCount} chosen</span>
                </Field>

                {/* push to the right, but stays INSIDE the card */}
                <div className="ml-auto">
                    <button
                        className="btn h-10 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canGenerate}
                        onClick={onGenerate}
                    >
                        Generate
                    </button>
                </div>
            </div>

            {hasCards && (
                <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>{progress.known} known</span>
                        <span>{progress.learning} learning</span>
                        <span>{progress.unknown} unseen</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                        <div className="bg-emerald-500" style={{ width: `${(progress.known / (progress.total || 1)) * 100}%` }} />
                        <div className="bg-amber-500"  style={{ width: `${(progress.learning / (progress.total || 1)) * 100}%` }} />
                        <div className="bg-slate-500"   style={{ width: `${(progress.unknown / (progress.total || 1)) * 100}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({ label, className = '', children }) {
    return (
        <label className={`block ${className}`}>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                {label}
            </div>
            {children}
        </label>
    );
}
