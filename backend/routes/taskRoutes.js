const express = require('express');
const {
  getTasks,
  createTask,
  updateStatus,
  assignTask,
  deleteTask,
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/status', updateStatus);
router.patch('/:id/assign', assignTask);
router.delete('/:id', deleteTask);

module.exports = router;
