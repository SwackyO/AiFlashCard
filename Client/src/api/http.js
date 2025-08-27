import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE;   // must be http://localhost:8000
if (!baseURL) console.warn('[http] VITE_API_BASE is missing!');

const http = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

export default http;
