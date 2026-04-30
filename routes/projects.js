const express = require('express');
const Joi = require('joi');
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const projCtrl = require('../controllers/projectController');
const router = express.Router();

router.use(requireAuth);

const projSchema = Joi.object({ name: Joi.string().required(), description: Joi.string().allow('', null) });
const memberSchema = Joi.object({ email: Joi.string().email().required(), role: Joi.string().valid('Admin', 'Member').required() });
const roleSchema = Joi.object({ role: Joi.string().valid('Admin', 'Member').required() });

router.post('/', validate(projSchema), projCtrl.createProject);
router.get('/', projCtrl.getProjects);
router.get('/:projectId', checkRole(['Admin', 'Member']), projCtrl.getProject);
router.get('/:projectId/members', checkRole(['Admin', 'Member']), projCtrl.getMembers);
router.post('/:projectId/members', checkRole(['Admin']), validate(memberSchema), projCtrl.addMember);
router.put('/:projectId/members/:userId', checkRole(['Admin']), validate(roleSchema), projCtrl.updateRole);
router.delete('/:projectId/members/:userId', checkRole(['Admin']), projCtrl.removeMember);

module.exports = router;
