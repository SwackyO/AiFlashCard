// src/App.jsx
import { Routes, Route, useParams } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import DecksPage from './pages/DecksPage';
import DeckView from './pages/DeckView';

export default function App() {
    return (
        <div className="min-h-screen">
            <NavBar />  {/* ✅ now safely inside BrowserRouter */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/decks" element={<DecksPage />} />
                <Route path="/decks/:id" element={<DeckViewWrapper />} />
            </Routes>
        </div>
    );
}

function DeckViewWrapper() {
    const { id } = useParams();
    return <DeckView deckId={id} />;
}
