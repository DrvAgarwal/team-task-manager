const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

exports.signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ error: 'Email in use' });
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({ name, email, password: hashedPassword });
        res.status(201).json({ message: 'User created' });
    } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid credentials' });

        const accessToken = jwt.sign({ userId: user._id }, env.jwtSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, env.jwtRefreshSecret, { expiresIn: '7d' });

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: env.nodeEnv === 'production', sameSite: 'strict' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: env.nodeEnv === 'production', sameSite: 'strict', path: '/' });
        res.json({ message: 'Logged in' });
    } catch (err) { next(err); }
};

exports.logout = (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Logged out' });
};
