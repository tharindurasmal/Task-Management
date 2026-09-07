const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');

const ALLOWED_STATUSES = ['todo', 'doing', 'done'];

const getTasks = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role !== 'admin') {
    filter = {
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id },
        { assignedTo: null },
      ],
    };
  }

  const tasks = await Task.find(filter)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ tasks });
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  const task = await Task.create({
    title,
    description: description || '',
    status: 'todo',
    createdBy: req.user.id,
    assignedTo: req.user.role === 'admin' ? assignedTo || null : null,
  });

  res.status(201).json({ task });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${ALLOWED_STATUSES.join(', ')}` });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (req.user.role !== 'admin') {
    const isOwner = task.createdBy.toString() === req.user.id;
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user.id;
    if (!isOwner && !isAssignee) {
      return res.status(403).json({ error: 'You do not have access to this task' });
    }
  }

  task.status = status;
  await task.save();

  res.status(200).json({ task });
});

const assignTask = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (req.user.role !== 'admin') {
    if (task.assignedTo) {
      return res.status(403).json({ error: 'Task is already assigned' });
    }
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only assign tasks to yourself' });
    }
  }

  task.assignedTo = userId;
  await task.save();

  const populated = await task.populate('assignedTo', 'name email');
  res.status(200).json({ task: populated });
});

// DELETE /api/tasks/:id
// Admin only — normal users cannot delete tasks, even their own.
const deleteTask = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only an admin can delete tasks' });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  await task.deleteOne();
  res.status(200).json({ message: 'Task deleted' });
});

module.exports = { getTasks, createTask, updateStatus, assignTask, deleteTask };