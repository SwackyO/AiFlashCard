import {Router} from 'express'
import { generateFlashcards } from '../controller/ai.controller.js';

const router = Router()

router.post('/generate', generateFlashcards);
export default router;