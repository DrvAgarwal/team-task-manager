const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const authCtrl = require('../controllers/authController');
const router = express.Router();

const signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/).required()
});
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

router.post('/signup', validate(signupSchema), authCtrl.signup);
router.post('/login', validate(loginSchema), authCtrl.login);
router.post('/logout', authCtrl.logout);

module.exports = router;
