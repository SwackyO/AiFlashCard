// src/components/TopicView.jsx
export default function TopicView({ node, id }) {
    if (!node) return null;

    const isUnit = /^\d+$/.test(id);

    // if it's a subtopic, server returns { id, title, bullets: [...] }
    const textFromSubtopic = Array.isArray(node.bullets)
        ? node.bullets.join('\n')
        : '';

    // if it's a unit, server returns merged text or we can synthesize from subtopics
    const textFromUnit = node.text || Object.entries(node.subtopics || {})
        .map(([k, v]) => `${k} ${v.title}\n${(v.bullets || []).join('\n')}`)
        .join('\n\n');

    const displayText = isUnit ? textFromUnit : textFromSubtopic;

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{id} — {node.title || (isUnit ? 'Unit' : 'Subtopic')}</h2>
            </div>
            <div className="mt-3 h-[40vh] overflow-auto rounded-xl bg-gray-50 p-3 text-sm whitespace-pre-wrap">
                {displayText || 'No content found for this topic.'}
            </div>
        </div>
    );
}
