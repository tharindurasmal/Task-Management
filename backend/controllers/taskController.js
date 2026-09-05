const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');

const ALLOWED_STATUSES = ['todo', 'doing', 'done'];

// GET /api/tasks
// Admins see every task. Normal users see tasks they created, tasks
// assigned to them, and any unassigned task (so they can claim it).
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

// POST /api/tasks
// Any authenticated user can create a task. It starts unassigned unless
// the creator is an admin explicitly assigning it on creation.
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
    // Only an admin may set an assignee at creation time; a normal user's
    // task always starts unassigned regardless of what they send.
    assignedTo: req.user.role === 'admin' ? assignedTo || null : null,
  });

  res.status(201).json({ task });
});

// PATCH /api/tasks/:id/status
// Moves a task between To Do / Doing / Done. This is what the frontend's
// drag-and-drop calls, and it must persist so a refresh doesn't lose it.
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${ALLOWED_STATUSES.join(', ')}` });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // A normal user may only move tasks that are theirs (created or assigned).
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

// PATCH /api/tasks/:id/assign
// THE CORE RBAC RULE FOR THIS ASSIGNMENT:
//   - Admin: can assign/reassign any task to any user, any time.
//   - Normal user: can only assign a task to THEMSELVES, and only if it
//     is currently unassigned. They can never touch anyone else's
//     assignment or reassign an already-assigned task.
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
// Optional but useful: creator or admin can delete a task.
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const isOwner = task.createdBy.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ error: 'Only the creator or an admin can delete this task' });
  }

  await task.deleteOne();
  res.status(200).json({ message: 'Task deleted' });
});

module.exports = { getTasks, createTask, updateStatus, assignTask, deleteTask };
