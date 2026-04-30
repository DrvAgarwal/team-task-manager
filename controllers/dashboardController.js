const Task = require('../models/Task');
const Team = require('../models/Team');

exports.getDashboard = async (req, res, next) => {
    try {
        const teams = await Team.find({ user: req.user._id });
        const adminProjects = teams.filter(t => t.role === 'Admin').map(t => t.project);
        const memberProjects = teams.filter(t => t.role === 'Member').map(t => t.project);

        const matchQuery = {
            $or: [
                { project: { $in: adminProjects } },
                { project: { $in: memberProjects }, assignee: req.user._id }
            ],
            status: { $ne: 'done' }
        };

        const overdue = await Task.find({ ...matchQuery, dueDate: { $lt: new Date() } }).populate('project', 'name').sort({ dueDate: 1 });
        const upcoming = await Task.find({ ...matchQuery, dueDate: { $gte: new Date() } }).populate('project', 'name').sort({ dueDate: 1 });

        res.json({ overdueTasks: overdue, upcomingTasks: upcoming });
    } catch (err) { next(err); }
};
