import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Badge, EmptyState, Spinner, statusColor, priorityColor, statusLabel } from '../UI';
import styles from './MyTasks.module.css';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tasks/my')
      .then(r => setTasks(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = {
    todo: tasks.filter(t => t.status === 'todo'),
    inprogress: tasks.filter(t => t.status === 'inprogress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Spinner size={28} />
    </div>
  );

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.title}>My Tasks</h1>
        <p className={styles.sub}>All tasks assigned to you across projects</p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No tasks assigned"
          desc="You don't have any tasks yet — ask your team admin to assign some"
        />
      ) : (
        <div className={styles.kanban}>
          {['todo', 'inprogress', 'done'].map(status => (
            <div key={status} className={styles.column}>
              <div className={styles.colHeader}>
                <Badge color={statusColor(status)}>{statusLabel(status)}</Badge>
                <span className={styles.colCount}>{grouped[status].length}</span>
              </div>
              <div className={styles.colCards}>
                {grouped[status].length === 0 ? (
                  <div className={styles.emptyCol}>No tasks here</div>
                ) : grouped[status].map(task => (
                  <div
                    key={task.id}
                    className={styles.taskCard}
                    onClick={() => navigate(`/projects/${task.project_id}`)}
                  >
                    <div className={styles.taskProject}>{task.project_name}</div>
                    <div className={styles.taskTitle}>{task.title}</div>
                    <div className={styles.taskFooter}>
                      <Badge color={priorityColor(task.priority)}>{task.priority}</Badge>
                      {task.due_date && (
                        <span className={`${styles.due} ${new Date(task.due_date) < new Date() && task.status !== 'done' ? styles.overdue : ''}`}>
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
