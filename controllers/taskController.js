const Task = require('../models/Task');
const Team = require('../models/Team');

exports.createTask = async (req, res, next) => {
    try {
        if (req.body.assignee && !(await Team.findOne({ project: req.body.projectId, user: req.body.assignee }))) {
            return res.status(400).json({ error: 'Assignee must be a team member' });
        }
        const task = await Task.create({ ...req.body, project: req.body.projectId, createdBy: req.user._id });
        res.status(201).json(task);
    } catch (err) { next(err); }
};

exports.getTasks = async (req, res, next) => {
    try {
        const query = { project: req.params.projectId };
        if (req.userRole === 'Member') query.assignee = req.user._id;
        res.json(await Task.find(query).populate('assignee', 'name email'));
    } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
    try {
        const task = req.task;
        if (req.body.assignee && req.body.assignee !== task.assignee?.toString()) {
            const membership = await Team.findOne({ project: task.project, user: req.user._id });
            if (membership.role !== 'Admin') return res.status(403).json({ error: 'Only Admins can reassign' });
            if (!(await Team.findOne({ project: task.project, user: req.body.assignee }))) return res.status(400).json({ error: 'Assignee must be a team member' });
        }
        const updated = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true });
        res.json(updated);
    } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const membership = await Team.findOne({ project: req.task.project, user: req.user._id });
        if (membership.role !== 'Admin') return res.status(403).json({ error: 'Admins only' });
        await Task.findByIdAndDelete(req.params.taskId);
        res.json({ message: 'Deleted' });
    } catch (err) { next(err); }
};
