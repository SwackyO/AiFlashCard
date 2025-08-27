// server/src/services/gemini.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { safeParseJson } from '../utils/parse.js';

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY; // accept either
if (!API_KEY) {
  console.warn('[gemini] Missing GEMINI_API_KEY/GOOGLE_API_KEY – calls will fail.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

/** Build flashcards */
export async function makeFlashcards({ specText, topic, count, difficulty }) {
  if (!model) throw Object.assign(new Error('Gemini API key not configured'), { status: 503 });

  const prompt = `
You generate concise study flashcards as strict JSON.
Schema: [{ "question": string, "answer": string, "topic": string, "difficulty": "easy"|"medium"|"hard", "distractors"?: string[] }]
Rules:
- Return ONLY JSON (no prose).
- ${count} cards max.
- Questions short; answers 1–3 sentences.
- If possible, include 3 plausible distractors for MCQ.
- Keep content accurate for A/GCSE-level physics, maths, or CS when relevant.

Make flashcards.
Topic: ${topic || 'N/A'}
Difficulty: ${difficulty}
Count: ${count}
Spec/Source (may be long):
${specText || '(none provided)'}
`.trim();

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const text = result?.response?.text?.() ?? '';
    const json = safeParseJson(text);

    if (!json || !Array.isArray(json)) {
      throw Object.assign(new Error('Model did not return valid JSON'), { status: 502, raw: text });
    }

    return json.slice(0, count).map(card => ({
      question: String(card.question || '').trim(),
      answer:   String(card.answer || '').trim(),
      topic:    String(card.topic || topic || 'General').trim(),
      difficulty: String(card.difficulty || difficulty || 'mixed').toLowerCase(),
      distractors: Array.isArray(card.distractors) ? card.distractors.slice(0, 3) : []
    }));
  } catch (err) {
    // Bubble up with useful context
    const msg = err?.message || String(err);
    throw Object.assign(new Error(`[Gemini] flashcards failed: ${msg}`), { status: err.status || 500, raw: err.raw });
  }
}

/** Extract subtopics for ONE unit (keep for fine-grained or fallback usage) */
export async function extractFullOutlineWithGemini({ board, specId, subject, fullText }) {
  if (!model) {
    return { board, spec_id: specId, subject, sections: {} };
  }

  const prompt = `
You are an expert syllabus parser. Read the Edexcel/Cambridge specification text and
produce a STRICT JSON outline with Units/Sections and Subtopics.

JSON SCHEMA (return ONLY JSON, no prose):
{
  "board": "${board}",
  "spec_id": "${specId}",
  "subject": "${subject}",
  "sections": {
    "1": {
      "title": "Unit/Section 1 Title",
      "subtopics": {
        "1.1": { "title": "Subtopic title", "bullets": ["learning outcome 1", "..."] },
        "1.2": { "title": "Subtopic title", "bullets": ["..."] }
      }
    },
    "2": { "...": "..." }
  }
}

RULES:
- HEADINGS TO DETECT (both boards):
  • EDEXCEL top-level: lines like "Unit 1: Mechanics and Materials", "Unit 2 – ...".
  • CAMBRIDGE top-level: numbered sections like "1 Information representation", "2 Communication", ..., including "AS content" (1–12) and "A Level content" (13–20). Treat each leading integer (e.g., 1, 2, … 20) as a section key.
  • SUBTOPICS (both): dotted numbers like "1.1 Data Representation", "2.4 Electric Circuits", "11.3 Structured Programming". Capture as keys "X.Y".
  • Also accept synonyms like "Topic", "Section", or "Part" if they follow the same numbering patterns.

- WHAT TO IGNORE (both boards):
  • Front matter (why choose…, aims, content/assessment overviews), admin tables, timetables, command words, teacher guidance, submission instructions, accessibility/equality, appendices, glossaries, mathematical skills/equations pages, page headers/footers, and page numbers.

- BULLETS / LEARNING OUTCOMES:
  • Derive concise outcomes (5–15 per subtopic) primarily from lines under phrases like:
      "Candidates should be able to:", "Learners should be able to:", "Students should be able to:",
      and supporting lists within "Notes and guidance" / "Teacher guidance" that describe assessable skills/knowledge.
  • Paraphrase to short, imperative outcomes; merge wrapped lines; remove redundancy and examples in parentheses unless essential.
  • Exclude tooling/admin-only notes (e.g., “candidates will not be required to write code”) unless it defines scope of learning.

- TEXT CLEANUP:
  • Merge hyphenated line breaks, unwrap wrapped lines, strip trailing page numbers and running headers/footers.
  • Remove table borders/columns; keep their meaningful text as plain lines.
  • Be conservative: if structure is ambiguous, omit rather than guess.

- STRUCTURE:
  • If a top-level section (Edexcel Unit or Cambridge Section) has no detectable subtopics (no "X.Y" lines beneath), include it with "subtopics": {}.
  • Preserve Cambridge numbering across AS (1–12) and A Level (13–20) in "sections" keys.
  • Preserve Edexcel unit numbers (1, 2, …) as "sections" keys.

SPEC TEXT:
"""${fullText}"""
`;


  const resp = await model.generateContent(prompt);
  const txt = resp.response.text();
  const json = safeParseJson(txt);
  return json || { board, spec_id: specId, subject, sections: {} };
}
