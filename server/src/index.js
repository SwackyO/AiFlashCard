import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import aiRoutes from "./routes/ai.routes.js";
import specRoutes from "./routes/spec.routes.js";
import mongoose from 'mongoose';
import decksRouter from './routes/decks.routes.js';


const app = express();

const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL, { autoIndex: true })
    .then(()=>console.log('✅ Mongo connected'))
    .catch(err=>console.error('Mongo error', err));

app.use(cors());
app.use(express.json());
app.use('/api/flashcards', aiRoutes);
app.use('/api/spec', specRoutes);
app.use('/api/decks', decksRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log('Server started successfully');