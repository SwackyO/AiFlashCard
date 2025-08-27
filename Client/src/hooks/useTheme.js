import { useEffect, useState } from 'react';

export function useTheme() {
    const [dark, setDark] = useState(() => {
        const v = localStorage.getItem('theme.dark');
        return v ? v === '1' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) root.classList.add('dark');
        else root.classList.remove('dark');
        localStorage.setItem('theme.dark', dark ? '1' : '0');
    }, [dark]);

    return { dark, setDark, toggle: () => setDark(d => !d) };
}
