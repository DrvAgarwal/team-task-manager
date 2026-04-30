const express = require('express');
const Joi = require('joi');
const { requireAuth } = require('../middleware/auth');
const { checkRole, checkTaskAccess } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const taskCtrl = require('../controllers/taskController');
const router = express.Router();

const taskSchema = Joi.object({
    title: Joi.string().required(), description: Joi.string().allow('', null),
    projectId: Joi.string().required(), assignee: Joi.string().allow('', null),
    status: Joi.string().valid('todo', 'in-progress', 'done').default('todo'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    dueDate: Joi.date().iso().required()
});
const updateTaskSchema = Joi.object({
    title: Joi.string(), description: Joi.string().allow('', null),
    assignee: Joi.string().allow('', null), status: Joi.string().valid('todo', 'in-progress', 'done'),
    priority: Joi.string().valid('low', 'medium', 'high'), dueDate: Joi.date().iso()
});

router.use(requireAuth);
router.post('/', checkRole(['Admin']), validate(taskSchema), taskCtrl.createTask);
router.get('/project/:projectId', checkRole(['Admin', 'Member']), taskCtrl.getTasks);
router.put('/:taskId', checkTaskAccess, validate(updateTaskSchema), taskCtrl.updateTask);
router.delete('/:taskId', checkTaskAccess, taskCtrl.deleteTask);

module.exports = router;
