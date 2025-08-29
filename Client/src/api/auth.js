import http from './http';

export const register = async (email, password, name) => {
    const { data } = await http.post('/api/auth/register', { email, password, name });
    if (data?.token) localStorage.setItem('access_token', data.token);
    return data;
};

export const login = async (email, password) => {
    const { data } = await http.post('/api/auth/login', { email, password });
    if (data?.token) localStorage.setItem('access_token', data.token);
    return data;
};

export const logout = async () => {
    localStorage.removeItem('access_token'); // clear header token too
    return http.post('/api/auth/logout');
};
