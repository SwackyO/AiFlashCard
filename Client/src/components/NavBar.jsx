import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function NavBar() {
    const { pathname } = useLocation();
    const { dark, toggle } = useTheme();

    return (
        <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur dark:bg-panel/80 dark:border-slate-800">
            <div className="container flex h-14 items-center justify-between">
                <Link to="/" className="font-semibold hover:opacity-90">AI Flashcards</Link>
                <nav className="flex items-center gap-2">
                    <Link
                        to="/"
                        className={`px-3 py-1.5 rounded-md transition ${
                            pathname === '/'
                                ? 'bg-slate-900 text-white dark:bg-brand'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/70'
                        }`}
                    >
                        Generator
                    </Link>
                    <Link
                        to="/decks"
                        className={`px-3 py-1.5 rounded-md transition ${
                            pathname.startsWith('/decks')
                                ? 'bg-slate-900 text-white dark:bg-brand'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/70'
                        }`}
                    >
                        Decks
                    </Link>

                    <button className="btn-ghost ml-2" onClick={toggle} title="Toggle theme">
                        {dark ? '🌙' : '☀️'}
                    </button>
                </nav>
            </div>
        </header>
    );
}
