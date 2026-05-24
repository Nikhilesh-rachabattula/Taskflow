const pool = require('../config/db');
const { validationResult } = require('express-validator');

const isProjectMember = async (projectId, userId) => {
  const r = await pool.query(
    'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return r.rows.length > 0 ? r.rows[0].role : null;
};

exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { projectId } = req.params;
  const { title, description, assigned_to, due_date, priority = 'medium' } = req.body;

  try {
    const role = await isProjectMember(projectId, req.user.id);
    if (!role) return res.status(403).json({ error: 'Access denied' });
    if (role !== 'admin') return res.status(403).json({ error: 'Only admins can create tasks' });

    if (assigned_to) {
      const check = await pool.query(
        'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, assigned_to]
      );
      if (check.rows.length === 0) return res.status(400).json({ error: 'Assignee is not a project member' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, project_id, assigned_to, created_by, due_date, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, projectId, assigned_to || null, req.user.id, due_date || null, priority]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  const { status, priority, assigned_to } = req.query;
  try {
    const role = await isProjectMember(projectId, req.user.id);
    if (!role) return res.status(403).json({ error: 'Access denied' });

    let query = `
      SELECT t.*, 
        u.name as assignee_name, u.email as assignee_email,
        c.name as creator_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      LEFT JOIN users c ON c.id = t.created_by
      WHERE t.project_id = $1
    `;
    const params = [projectId];
    let idx = 2;

    if (status) { query += ` AND t.status = $${idx++}`; params.push(status); }
    if (priority) { query += ` AND t.priority = $${idx++}`; params.push(priority); }
    if (assigned_to) { query += ` AND t.assigned_to = $${idx++}`; params.push(assigned_to); }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  try {
    const role = await isProjectMember(projectId, req.user.id);
    if (!role) return res.status(403).json({ error: 'Access denied' });

    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND project_id = $2',
      [taskId, projectId]
    );
    if (taskResult.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

    const task = taskResult.rows[0];
    const isMember = role === 'member';

    // Members can only update status of their own tasks
    if (isMember && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'You can only update tasks assigned to you' });
    }

    const { title, description, assigned_to, due_date, priority, status } = req.body;

    const updatedTitle = isMember ? task.title : (title ?? task.title);
    const updatedDesc = isMember ? task.description : (description ?? task.description);
    const updatedAssignee = isMember ? task.assigned_to : (assigned_to !== undefined ? assigned_to : task.assigned_to);
    const updatedDueDate = isMember ? task.due_date : (due_date !== undefined ? due_date : task.due_date);
    const updatedPriority = isMember ? task.priority : (priority ?? task.priority);
    const updatedStatus = status ?? task.status;

    const result = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, assigned_to=$3, due_date=$4, priority=$5, status=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [updatedTitle, updatedDesc, updatedAssignee, updatedDueDate, updatedPriority, updatedStatus, taskId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  try {
    const role = await isProjectMember(projectId, req.user.id);
    if (role !== 'admin') return res.status(403).json({ error: 'Only admins can delete tasks' });

    await pool.query('DELETE FROM tasks WHERE id = $1 AND project_id = $2', [taskId, projectId]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, p.name as project_name
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.assigned_to = $1
       ORDER BY t.due_date ASC NULLS LAST`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    // Get all project IDs the user belongs to
    const projectsResult = await pool.query(
      'SELECT project_id FROM project_members WHERE user_id = $1',
      [req.user.id]
    );
    const projectIds = projectsResult.rows.map(r => r.project_id);
    if (projectIds.length === 0) {
      return res.json({
        total_tasks: 0, by_status: [], by_user: [], overdue: 0, my_tasks: 0
      });
    }

    const [total, byStatus, byUser, overdue, myTasks] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM tasks WHERE project_id = ANY($1)`, [projectIds]),
      pool.query(`SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ANY($1) GROUP BY status`, [projectIds]),
      pool.query(`
        SELECT u.name, u.id, COUNT(t.id) as task_count
        FROM tasks t JOIN users u ON u.id = t.assigned_to
        WHERE t.project_id = ANY($1) AND t.assigned_to IS NOT NULL
        GROUP BY u.id, u.name ORDER BY task_count DESC LIMIT 10
      `, [projectIds]),
      pool.query(`
        SELECT COUNT(*) FROM tasks 
        WHERE project_id = ANY($1) AND due_date < NOW() AND status != 'done'
      `, [projectIds]),
      pool.query(`SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status != 'done'`, [req.user.id]),
    ]);

    res.json({
      total_tasks: parseInt(total.rows[0].count),
      by_status: byStatus.rows,
      by_user: byUser.rows,
      overdue: parseInt(overdue.rows[0].count),
      my_tasks: parseInt(myTasks.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
