import http from './http';

// Upload PDF (multipart)
export async function uploadSpec({ file, config }) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await http.post(`/api/spec/upload?config=${encodeURIComponent(config)}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}

export async function getTopics(config) {
    const { data } = await http.get(`/api/spec/topics?config=${encodeURIComponent(config)}`);
    return data; // { board, spec_id, subject, sections }
}

export async function getTopic(config, id) {
    const { data } = await http.get(`/api/spec/topic/${encodeURIComponent(id)}?config=${encodeURIComponent(config)}`);
    return data; // { id, title, text, subtopics? }
}
