const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', optionalAuth, (req, res) => res.redirect(req.user ? '/dashboard' : '/login'));
router.get('/login', optionalAuth, (req, res) => req.user ? res.redirect('/dashboard') : res.render('login'));
router.get('/signup', optionalAuth, (req, res) => req.user ? res.redirect('/dashboard') : res.render('signup'));
router.get('/dashboard', requireAuth, (req, res) => res.render('dashboard', { user: req.user }));
router.get('/projects', requireAuth, (req, res) => res.render('projects', { user: req.user }));
router.get('/projects/:projectId/tasks', requireAuth, (req, res) => res.render('tasks', { user: req.user, projectId: req.params.projectId }));

module.exports = router;
