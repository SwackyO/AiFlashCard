import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const router = Router();

function issue(res, user) {
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const prod = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: prod ? 'none' : 'lax',  // <-- must be 'none' in prod (cross-site)
        secure: prod,                     // <-- must be true on HTTPS
        maxAge: 7 * 24 * 3600 * 1000
    });
}

router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const u = new User({ email, name });
    await u.setPassword(password);
    await u.save();
    issue(res, u);
    res.json({ id: u._id, email: u.email, name: u.name });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u || !(await u.checkPassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    issue(res, u);
    res.json({ id: u._id, email: u.email, name: u.name });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
});

router.get('/me', (req, res) => {
    // optionally decode JWT here, or use requireAuth and return req.user
    res.json({ ok: true });
});

export default router;
