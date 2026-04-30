const Project = require('../models/Project');
const Team = require('../models/Team');
const User = require('../models/User');

exports.createProject = async (req, res, next) => {
    try {
        const project = await Project.create({ ...req.body, createdBy: req.user._id });
        await Team.create({ project: project._id, user: req.user._id, role: 'Admin' });
        res.status(201).json(project);
    } catch (err) { next(err); }
};

exports.getProjects = async (req, res, next) => {
    try {
        const teams = await Team.find({ user: req.user._id }).populate('project');
        res.json(teams.map(t => ({ ...t.project.toObject(), myRole: t.role })));
    } catch (err) { next(err); }
};

exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        res.json({ project, role: req.userRole });
    } catch (err) { next(err); }
};

exports.getMembers = async (req, res, next) => {
    try {
        res.json(await Team.find({ project: req.params.projectId }).populate('user', 'name email'));
    } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
    try {
        const userToAdd = await User.findOne({ email: req.body.email });
        if (!userToAdd) return res.status(404).json({ error: 'User not found' });
        if (await Team.findOne({ project: req.params.projectId, user: userToAdd._id })) return res.status(400).json({ error: 'Already a member' });
        const member = await Team.create({ project: req.params.projectId, user: userToAdd._id, role: req.body.role });
        res.status(201).json(member);
    } catch (err) { next(err); }
};

exports.updateRole = async (req, res, next) => {
    try {
        await Team.findOneAndUpdate({ project: req.params.projectId, user: req.params.userId }, { role: req.body.role });
        res.json({ message: 'Role updated' });
    } catch (err) { next(err); }
};

exports.removeMember = async (req, res, next) => {
    try {
        if (req.params.userId === req.user._id.toString()) return res.status(400).json({ error: 'Cannot remove yourself' });
        await Team.findOneAndDelete({ project: req.params.projectId, user: req.params.userId });
        res.json({ message: 'Member removed' });
    } catch (err) { next(err); }
};
