const Team = require('../models/Team');

exports.checkRole = (allowedRoles) => async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.body.projectId;
        if (!projectId) return res.status(400).json({ error: 'Project ID required' });
        const membership = await Team.findOne({ project: projectId, user: req.user._id });
        if (!membership) return res.status(403).json({ error: 'Access denied: Not a member' });
        req.userRole = membership.role;
        if (!allowedRoles.includes(membership.role)) return res.status(403).json({ error: `Requires role: ${allowedRoles.join(', ')}` });
        next();
    } catch (error) { next(error); }
};

exports.checkTaskAccess = async (req, res, next) => {
    try {
        const Task = require('../models/Task');
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        req.task = task;
        const membership = await Team.findOne({ project: task.project, user: req.user._id });
        if (!membership) return res.status(403).json({ error: 'Access denied' });
        if (membership.role === 'Admin') return next();
        if (!task.assignee || task.assignee.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Members can only manage their assigned tasks' });
        }
        next();
    } catch (error) { next(error); }
};
