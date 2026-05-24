const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/',
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  projectController.createProject
);

router.get('/', projectController.getMyProjects);
router.get('/:projectId', projectController.getProject);
router.delete('/:projectId', projectController.deleteProject);

router.get('/:projectId/members', projectController.getProjectMembers);
router.post('/:projectId/members',
  [body('email').isEmail().withMessage('Valid email required')],
  projectController.addMember
);
router.delete('/:projectId/members/:userId', projectController.removeMember);

module.exports = router;
