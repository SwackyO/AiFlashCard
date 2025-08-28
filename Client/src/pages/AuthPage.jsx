import { useState } from 'react';
import { login, register } from '../api/auth';

export default function AuthPage({ onAuthed }) {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            if (mode === 'register') {
                await register(email.trim(), password, name.trim());
            } else {
                await login(email.trim(), password);
            }
            onAuthed?.();
        } catch (e) {
            setErr(e?.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="card max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    {mode === 'login' ? 'Sign in to AI Flashcards' : 'Create your account'}
                </h1>

                <form onSubmit={submit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm mb-1">Name</label>
                            <input
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {err && <div className="text-sm text-red-500">{err}</div>}

                    <button type="submit" className="btn w-full" disabled={loading}>
                        {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    {mode === 'login' ? (
                        <>
                            Don’t have an account?{' '}
                            <button type="button" className="btn-ghost" onClick={() => setMode('register')}>
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already registered?{' '}
                            <button type="button" className="btn-ghost" onClick={() => setMode('login')}>
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
