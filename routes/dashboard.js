const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.get('/', requireAuth, require('../controllers/dashboardController').getDashboard);
module.exports = router;
