import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE; // http://localhost:3000
const http = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,   // ← important
});
export default http;
