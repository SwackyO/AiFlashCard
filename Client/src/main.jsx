import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import AuthPage from './pages/AuthPage.jsx';
import { me } from './api/auth';
import App from './App.jsx'; // or DecksPage
import './index.css';

function Root() {
    const [authed, setAuthed] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        (async () => {
            const { ok } = await me();
            setAuthed(ok);
            setChecking(false);
        })();
    }, []);

    if (checking) return <div style={{ padding: 24 }}>Loading…</div>;
    return authed ? <App /> : <AuthPage onAuthed={() => setAuthed(true)} />;
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Root />
    </BrowserRouter>
);
