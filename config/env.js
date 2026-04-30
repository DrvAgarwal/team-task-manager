require('dotenv').config();
module.exports = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development'
};
