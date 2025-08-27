// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { ToastProvider } from './components/ui/Toast.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ToastProvider>
        <BrowserRouter>   {/* 👈 provides Router context */}
            <App />
        </BrowserRouter>
        </ToastProvider>
    </React.StrictMode>
);
