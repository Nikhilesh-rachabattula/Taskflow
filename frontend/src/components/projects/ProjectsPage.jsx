import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Button, Card, EmptyState, Modal, FormField, Spinner } from '../UI';
import styles from './Projects.module.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = () => {
    setLoading(true);
    api.get('/projects')
      .then(r => setProjects(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.sub}>Manage your team workspaces</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Project</Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner size={28} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No projects yet"
          desc="Create your first project and invite your team"
          action={<Button onClick={() => setShowCreate(true)}>Create Project</Button>}
        />
      ) : (
        <div className={styles.grid}>
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchProjects(); }}
      />
    </div>
  );
}

function ProjectCard({ project, onClick }) {
  return (
    <div className={styles.projectCard} onClick={onClick}>
      <div className={styles.cardTop}>
        <div className={styles.cardIcon}>{project.name[0].toUpperCase()}</div>
        <span className={`${styles.roleBadge} ${project.role === 'admin' ? styles.adminBadge : ''}`}>
          {project.role}
        </span>
      </div>
      <h3 className={styles.cardTitle}>{project.name}</h3>
      {project.description && (
        <p className={styles.cardDesc}>{project.description}</p>
      )}
      <div className={styles.cardMeta}>
        <span>◎ {project.task_count} tasks</span>
        <span>👤 {project.member_count} members</span>
      </div>
    </div>
  );
}

function CreateProjectModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
        <FormField label="Project Name">
          <input
            required value={form.name} placeholder="e.g. Marketing Campaign"
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </FormField>
        <FormField label="Description (optional)">
          <textarea
            rows={3} value={form.description} placeholder="What's this project about?"
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            style={{ resize: 'vertical' }}
          />
        </FormField>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Project</Button>
        </div>
      </form>
    </Modal>
  );
}
