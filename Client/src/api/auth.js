import http from './http';

export const register = (email, password, name) =>
    http.post('/api/auth/register', { email, password, name }).then(r => r.data);

export const login = (email, password) =>
    http.post('/api/auth/login', { email, password }).then(r => r.data);

export const logout = () =>
    http.post('/api/auth/logout').then(r => r.data);

// optional: verify session
export const me = () =>
    http.get('/api/decks') // any protected route works; 200 = authed, 401 = not
        .then(() => ({ ok: true }))
        .catch(() => ({ ok: false }));
