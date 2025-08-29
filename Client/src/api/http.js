import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE; // http://localhost:3000
const http = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,   // ← important
});

http.interceptors.request.use((cfg) => {
      const t = localStorage.getItem('access_token');
      if (t) cfg.headers.Authorization = `Bearer ${t}`;
      return cfg;
    });

export default http;
