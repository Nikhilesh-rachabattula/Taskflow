import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Button, Badge, Modal, FormField, EmptyState, Spinner, statusColor, priorityColor, statusLabel } from '../UI';
import styles from './ProjectDetail.module.css';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['todo', 'inprogress', 'done'];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const isAdmin = project?.role === 'admin';

  const fetchAll = useCallback(async () => {
    try {
      const [proj, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks/projects/${projectId}`),
        api.get(`/projects/${projectId}/members`),
      ]);
      setProject(proj.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      if (err.response?.status === 403) navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchTasks = async () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    const res = await api.get(`/tasks/projects/${projectId}`, { params });
    setTasks(res.data);
  };

  useEffect(() => { if (project) fetchTasks(); }, [filters]);

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    await api.delete(`/projects/${projectId}`);
    navigate('/projects');
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    await api.delete(`/projects/${projectId}/members/${userId}`);
    fetchAll();
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Spinner size={28} />
    </div>
  );

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/projects')}>← Back</button>
        <div className={styles.headerMain}>
          <div>
            <h1 className={styles.title}>{project?.name}</h1>
            {project?.description && <p className={styles.desc}>{project.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isAdmin && (
              <>
                <Button variant="secondary" size="sm" onClick={() => setShowAddMember(true)}>+ Add Member</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowCreateTask(true)}>+ Add Task</Button>
                <Button variant="danger" size="sm" onClick={handleDeleteProject}>Delete</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {['tasks', 'members'].map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`} onClick={() => setTab(t)}>
            {t === 'tasks' ? `◎ Tasks (${tasks.length})` : `👤 Members (${members.length})`}
          </button>
        ))}
      </div>

      {tab === 'tasks' && (
        <>
          <div className={styles.filters}>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ width: 'auto' }}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
            <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))} style={{ width: 'auto' }}>
              <option value="">All Priority</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon="◎"
              title="No tasks yet"
              desc={isAdmin ? "Create the first task for this project" : "No tasks assigned yet"}
              action={isAdmin && <Button onClick={() => setShowCreateTask(true)}>+ Add Task</Button>}
            />
          ) : (
            <div className={styles.taskList}>
              {tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  currentUserId={user?.id}
                  onEdit={() => setEditTask(task)}
                  onDelete={async () => {
                    if (!confirm('Delete this task?')) return;
                    await api.delete(`/tasks/projects/${projectId}/${task.id}`);
                    fetchTasks();
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'members' && (
        <div className={styles.memberList}>
          {members.map(m => (
            <div key={m.id} className={styles.memberRow}>
              <div className={styles.memberAvatar}>{m.name[0].toUpperCase()}</div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>{m.name}</div>
                <div className={styles.memberEmail}>{m.email}</div>
              </div>
              <Badge color={m.role === 'admin' ? 'warning' : 'default'}>{m.role}</Badge>
              {isAdmin && m.id !== user?.id && (
                <Button variant="danger" size="sm" onClick={() => handleRemoveMember(m.id)}>Remove</Button>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        members={members}
        projectId={projectId}
        onCreated={() => { setShowCreateTask(false); fetchTasks(); }}
      />

      <EditTaskModal
        open={!!editTask}
        task={editTask}
        members={members}
        isAdmin={isAdmin}
        currentUserId={user?.id}
        projectId={projectId}
        onClose={() => setEditTask(null)}
        onUpdated={() => { setEditTask(null); fetchTasks(); }}
      />

      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        projectId={projectId}
        onAdded={() => { setShowAddMember(false); fetchAll(); }}
      />
    </div>
  );
}

function TaskRow({ task, isAdmin, currentUserId, onEdit, onDelete }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const canEdit = isAdmin || task.assigned_to === currentUserId;

  return (
    <div className={styles.taskRow}>
      <div className={styles.taskMain}>
        <div className={styles.taskTitle}>{task.title}</div>
        {task.description && <div className={styles.taskDesc}>{task.description}</div>}
        <div className={styles.taskMeta}>
          <Badge color={statusColor(task.status)}>{statusLabel(task.status)}</Badge>
          <Badge color={priorityColor(task.priority)}>{task.priority}</Badge>
          {task.assignee_name && <span className={styles.assignee}>→ {task.assignee_name}</span>}
          {task.due_date && (
            <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
              {isOverdue ? '⚠ ' : ''}Due {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className={styles.taskActions}>
        {canEdit && <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>}
        {isAdmin && <Button variant="danger" size="sm" onClick={onDelete}>✕</Button>}
      </div>
    </div>
  );
}

function CreateTaskModal({ open, onClose, members, projectId, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(`/tasks/projects/${projectId}`, {
        ...form,
        assigned_to: form.assigned_to || undefined,
        due_date: form.due_date || undefined,
      });
      setForm({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
        <FormField label="Title">
          <input required value={form.title} placeholder="Task title" onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </FormField>
        <FormField label="Description">
          <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <FormField label="Priority">
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </FormField>
          <FormField label="Due Date">
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </FormField>
        </div>
        <FormField label="Assign To">
          <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
            <option value="">Unassigned</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </FormField>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}

function EditTaskModal({ open, task, members, isAdmin, currentUserId, projectId, onClose, onUpdated }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        priority: task.priority,
        status: task.status,
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/tasks/projects/${projectId}/${task.id}`, {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      });
      onUpdated();
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isAdmin && (
          <>
            <FormField label="Title">
              <input required value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </FormField>
            <FormField label="Description">
              <textarea rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </FormField>
          </>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <FormField label="Status">
            <select value={form.status || 'todo'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['todo', 'inprogress', 'done'].map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
          </FormField>
          {isAdmin && (
            <FormField label="Priority">
              <select value={form.priority || 'medium'} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </FormField>
          )}
        </div>
        {isAdmin && (
          <>
            <FormField label="Due Date">
              <input type="date" value={form.due_date || ''} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </FormField>
            <FormField label="Assign To">
              <select value={form.assigned_to || ''} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </FormField>
          </>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}

function AddMemberModal({ open, onClose, projectId, onAdded }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(`/projects/${projectId}/members`, { email, role });
      setEmail('');
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Member">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
        <FormField label="Email Address">
          <input type="email" required value={email} placeholder="teammate@example.com" onChange={e => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Role">
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add Member</Button>
        </div>
      </form>
    </Modal>
  );
}
