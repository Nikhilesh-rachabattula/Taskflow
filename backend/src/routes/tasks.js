const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/my', taskController.getMyTasks);
router.get('/dashboard', taskController.getDashboard);

router.post('/projects/:projectId',
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  taskController.createTask
);

router.get('/projects/:projectId', taskController.getProjectTasks);
router.put('/projects/:projectId/:taskId', taskController.updateTask);
router.delete('/projects/:projectId/:taskId', taskController.deleteTask);

module.exports = router;
