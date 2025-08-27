// server/src/utils/spec-parse.js
export function buildOutlineFromText(text, cfg) {
    // 1) normalize
    let body = text.replace(/\r/g, '');
    if (cfg?.normalize?.squashSpaces) body = body.replace(/[ \t]+/g, ' ');
    body = body.replace(/\n{2,}/g, '\n');

    if (cfg?.normalize?.dropLinesMatching) {
        const regs = cfg.normalize.dropLinesMatching.map(r => new RegExp(r, 'i'));
        body = body
            .split('\n')
            .filter(line => !regs.some(rx => rx.test(line)))
            .join('\n');
    }
    if (cfg?.normalize?.mergeWrappedBullets) {
        body = body.replace(/\n([•\-–])\s*/g, '\n$1 ');
    }

    // 2) compile regexes from config
    const sectionRx  = new RegExp(cfg.sectionHeading, 'i'); // e.g. ^Unit (\d+): (Title)(?: \d+)?$
    const subtopicRx = new RegExp(cfg.subtopicHeading, 'i'); // e.g. ^(\d+)\.(\d+) Title(?: \d+)?$
    const stopRx     = cfg.stopAt ? new RegExp(cfg.stopAt, 'i') : null;

    // 3) iterate lines
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean);

    const outline = {};
    const unitBlocks = {};          // NEW: raw text per unit
    let currentSection = null;
    let currentSubId = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (stopRx && stopRx.test(line)) break;

        // SECTION?
        const sm = line.match(sectionRx);
        if (sm) {
            const secId = sm[1];
            const secTitle = (sm[2] || '').replace(/\s+\d+$/, '').trim(); // strip trailing page numbers
            outline[secId] = { title: secTitle, subtopics: {} };
            currentSection = secId;
            currentSubId = null;
            if (!unitBlocks[secId]) unitBlocks[secId] = '';
            // include the heading line as the start of the unit block
            unitBlocks[secId] += (unitBlocks[secId] ? '\n' : '') + line;
            continue;
        }

        if (!currentSection) continue; // ignore text before first unit

        // SUBTOPIC?
        const tm = line.match(subtopicRx);
        if (tm) {
            const unitFromId = tm[1];
            if (String(unitFromId) !== String(currentSection)) {
                // Wrong unit number (e.g., a figure reference), ignore
            } else {
                const subId = `${tm[1]}.${tm[2]}`;
                const subTitle = (tm[3] || '').replace(/\s+\d+$/, '').trim();
                if (!/assessment information/i.test(subTitle)) {
                    outline[currentSection].subtopics[subId] = { title: subTitle, text: '' };
                    currentSubId = subId;
                    // also write the subtopic heading into the unit block
                    unitBlocks[currentSection] += '\n' + line;
                    continue;
                }
            }
        }

        // Content lines: append to current subtopic text (avoid lines that are only numbers/symbols)
        if (currentSubId) {
            const node = outline[currentSection].subtopics[currentSubId];
            if (!/^[\d .,/=+()*×–\-:±%eE]+$/.test(line)) {
                node.text += (node.text ? '\n' : '') + line;
            }
        }

        // Always keep building the raw unit block for Gemini fallback
        unitBlocks[currentSection] += '\n' + line;
    }

    return { outline, unitBlocks };
}
