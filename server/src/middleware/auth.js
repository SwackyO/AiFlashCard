import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/,'');
    if (!token) return res.status(401).json({ error: 'Auth required' });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id, email: payload.email };
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid/expired token' });
    }
}
