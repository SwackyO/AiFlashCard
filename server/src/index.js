import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import aiRoutes from './routes/ai.routes.js';
import specRoutes from './routes/spec.routes.js';
import decksRouter from './routes/decks.routes.js';
import authRoutes from './routes/auth.routes.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
app.set('trust proxy', 1);

// --- DB ---
const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL, { autoIndex: true })
    .then(()=>console.log('✅ Mongo connected'))
    .catch(err=>console.error('Mongo error', err));

// --- middleware ---
const ALLOWED = [
    'http://localhost:5173',
    'http://localhost:5174',
];
const allow = (origin) =>
    !origin ||
    ALLOWED.includes(origin) ||
    /\.vercel\.app$/.test(new URL(origin).hostname) ||   // preview deployments
    /your-custom-domain\.com$/.test(new URL(origin).hostname); // if you add one

app.use(cors({ origin: (o, cb) => cb(null, allow(o)), credentials: true }));
app.use(cookieParser());
app.use(express.json());

// --- routes ---
app.use('/api/auth', authRoutes);                         // public
app.use('/api/flashcards', requireAuth, aiRoutes);        // protected
app.use('/api/spec', requireAuth, specRoutes);            // protect if user-specific
app.use('/api/decks', requireAuth, decksRouter);          // protected

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log('Server started successfully');
