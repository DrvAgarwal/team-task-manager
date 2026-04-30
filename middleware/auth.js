const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) throw new Error('No token');
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = await User.findById(decoded.userId).select('-password');
        if (!req.user) throw new Error('User not found');
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError' && req.cookies.refreshToken) {
            try {
                const decoded = jwt.verify(req.cookies.refreshToken, env.jwtRefreshSecret);
                req.user = await User.findById(decoded.userId).select('-password');
                const newAccessToken = jwt.sign({ userId: req.user._id }, env.jwtSecret, { expiresIn: '15m' });
                res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: env.nodeEnv === 'production', sameSite: 'strict' });
                return next();
            } catch (err) { res.clearCookie('accessToken'); res.clearCookie('refreshToken'); }
        } else {
            res.clearCookie('accessToken'); res.clearCookie('refreshToken');
        }
        if (req.originalUrl.startsWith('/api')) return res.status(401).json({ error: 'Unauthorized' });
        return res.redirect('/login');
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (token) {
            const decoded = jwt.verify(token, env.jwtSecret);
            req.user = await User.findById(decoded.userId).select('-password');
        }
    } catch (e) { }
    next();
};

module.exports = { requireAuth, optionalAuth };
